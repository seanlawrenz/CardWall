import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SortablejsOptions } from 'angular-sortablejs';

import { CardService } from '@app/app-services/card.service';
import { Card, List, Plan, SignalRResult, Resources } from '@app/models';

import { Store, select } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { fromRoot, rootSelectors } from '@app/store';
import * as fromBacklog from '@app/backlog/state';
import * as cardActions from '@app/store/actions/card.actions';
import * as uiActions from '@app/store/actions/ui.actions';

import { SignalRService } from '@app/app-services';
import { getRelativeMoveCardId } from '@app/utils';

import { filter } from 'lodash';

/**
 * Not sure the issue here, but not able to import this enum
 * so it is declared here
 */
export enum CardMovementTypes {
  START = 'START',
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  END = 'END',
}

@Component({
  selector: 'td-backlog-cards-controller',
  templateUrl: './backlog-cards-controller.component.html',
  styleUrls: ['./backlog-cards-controller.component.scss'],
})
export class BacklogCardsControllerComponent implements OnInit, OnDestroy {
  @Input() cards: Card[];
  @Input() listInfo: { listId: number; projectId: number; planId: number };

  plan$: Observable<Plan>;

  isCardsFiltered = false;
  cardsWithSelectedResource: number[] = [];

  private unsubscribe$ = new Subject<void>();

  // Card Move
  sortableOptions: SortablejsOptions = {
    group: {
      name: 'backlog-cards',
      revertClone: false,
      put: ['backlog-cards'],
    },
    scroll: true,
    scrollSpeed: 10,
    scrollSensitivity: 150,
    ghostClass: 'tdNg-backlog-dragging-overlay-blue',
    onStart: event => this.cardMovement(event, CardMovementTypes.START),
    onAdd: event => this.cardMovement(event, CardMovementTypes.ADD),
    onEnd: event => this.cardMovement(event, CardMovementTypes.END),
  };

  constructor(
    private cardService: CardService,
    private signalRService: SignalRService,
    private store: Store<fromRoot.State>,
    private updates$: Actions,
  ) {}

  ngOnInit() {
    // This is to pass the plan data down to the card for card details if card is opened
    this.plan$ = this.store.pipe(select(fromBacklog.getPlanById(this.listInfo.planId)));

    this.store
      .select(rootSelectors.getCurrentResource)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(resource => {
        this.updateSelectedResource(resource);
      });

    this.store
      .select(fromBacklog.getSearch)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(term => {
        if (typeof term === 'string') {
          this.isCardsFiltered = term === '';
        } else {
          this.isCardsFiltered = term.length === 0;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cardMovement(event, type: string) {
    const { newIndex, oldIndex } = event;
    switch (type) {
      case CardMovementTypes.START:
        event.clone.cardData = this.cards[oldIndex];
        break;

      case CardMovementTypes.ADD:
        const {
          clone: { cardData },
        } = event;
        const { listId, projectId, planId } = this.listInfo;
        cardData.listId = listId;

        if (cardData.projectId !== projectId || cardData.planId !== planId) {
          cardData.projectId = projectId;
          cardData.planId = planId;
        }
        break;

      case CardMovementTypes.END:
        if (newIndex === oldIndex && event.clone.cardData.listId === this.listInfo.listId) {
          return;
        }
        this.dragCardEnd(event.clone.cardData, newIndex, oldIndex);
    }
  }

  /**
   * The end of a drag is called on the component that the drag originated from.
   * This card could be heading to a new list in a new plan or project.
   */
  private dragCardEnd(card: Card, newIndex: number, oldIndex: number) {
    this.store.dispatch(new uiActions.ShowSaving());
    // Move within this list
    if (card.listId === this.listInfo.listId) {
      this.cardService
        .moveCardWithInSameList(this.cards, newIndex)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.store.dispatch(new uiActions.HideSaving());
        });
      return;
    }

    // Move to new lists within this board
    if (card.listId !== this.listInfo.listId && card.planId === this.listInfo.planId) {
      // Get the list to where this card is heading
      this.store.select(fromBacklog.getListById(card.planId, card.listId)).subscribe((list: List) => {
        this.cardService
          .moveCardToListInSameBoard(list.cards, card, this.listInfo.listId, newIndex)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(() => {
            this.store.dispatch(new uiActions.HideSaving());
          });
      });
    } else {
      // Move outside of project or plan
      const { projectId, planId, listId } = this.listInfo;
      // Signal R wants original card with old plan, project and list data
      const originatedCard = { ...card, projectId, planId, listId };
      this.store.select(fromBacklog.getListById(card.planId, card.listId)).subscribe((list: List) => {
        const relativeMoveCardId = getRelativeMoveCardId(list.cards, card, newIndex);
        this.signalRService
          .invoke('CardMoveRelativeTo', originatedCard, card.projectId, card.planId, card.listId, relativeMoveCardId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((res: SignalRResult) => {
            if (res.isSuccessful) {
              // If the client moves the card to a new project or plan
              // the response from the server does not have the location of the old card
              // This will remove it AFTER it has been deleted server side keeping a smooth UX
              this.updates$
                .pipe(
                  ofType(cardActions.CardActionTypes.CARD_DELETE_FROM_SERVER),
                  takeUntil(this.unsubscribe$),
                  tap(() => this.store.dispatch(new fromBacklog.DeleteCardOnBacklog(card))),
                )
                .subscribe(() => this.store.dispatch(new uiActions.HideSaving()));
            } else {
              // Still hide the saving
              this.store.dispatch(new uiActions.HideSaving());
            }
          });
      });
    }
  }

  private updateSelectedResource(resource: Resources) {
    this.cardsWithSelectedResource = [];
    if (resource) {
      this.cards.map(card => {
        if (card.owners && card.owners.length > 0) {
          if (filter(card.owners, o => o.uid === resource.uid).length > 0) {
            this.cardsWithSelectedResource.push(card.id);
          }
        }
      });
    }
  }
}
