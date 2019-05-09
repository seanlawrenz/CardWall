import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Card, CardDetailsPageTypes, Plan, Resources } from '@app/models';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';

import { fromRoot } from '@app/store';
import * as fromBacklog from '@app/backlog/state';
import * as cardActions from '@app/store/actions/card.actions';
import * as cardDetailActions from '@app/card-details/state/actions';

import { CardService } from '@app/app-services';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'td-backlog-card-controller',
  templateUrl: './backlog-card-controller.component.html',
  styleUrls: ['./backlog-card-controller.component.scss'],
})
export class BacklogCardControllerComponent implements OnInit, OnDestroy {
  @Input() card: Card;
  @Input() plan: Plan;
  @Input() isOdd: boolean;
  @Input() isOwnerSelected: boolean;

  isCardSelected = false;

  // UI Settings
  showEstimateHours$: Observable<boolean>;
  showStoryPoints$: Observable<boolean>;

  unsubscribe$ = new Subject<void>();

  constructor(private store: Store<fromRoot.State>, private cardService: CardService) {}

  ngOnInit() {
    this.showEstimateHours$ = this.store.pipe(select(fromBacklog.showEstimateHours));
    this.showStoryPoints$ = this.store.pipe(select(fromBacklog.showStoryPoints));

    this.store.pipe(select(fromRoot.getSelectedCard)).subscribe(card => {
      if (card === undefined) {
        this.isCardSelected = false;
        return;
      }
      this.isCardSelected = card.id === this.card.id;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  selectCard() {
    this.store.dispatch(new cardActions.CardSelected(this.card));
  }

  showCardDetails(type: CardDetailsPageTypes) {
    this.store.dispatch(new cardDetailActions.CurrentCard({ card: this.card, plan: this.plan }));
    if (type === undefined || type === CardDetailsPageTypes.FORM) {
      this.store.dispatch(new cardDetailActions.ShowForm());
    } else if (type === CardDetailsPageTypes.SUBTASKS) {
      this.store.dispatch(new cardDetailActions.ShowSubtasks());
    }
  }

  archiveCard() {
    const card = { ...this.card };
    this.store.dispatch(new cardActions.ArchiveCard({ card, plan: this.plan }));
  }

  addResourceToCard(event: { resource: Resources; clearAssignments: boolean }) {
    // There are 2 drag and drop listeners on this app. So we must squash the cross listener
    if (!event || !event.resource) {
      return;
    }

    const { resource, clearAssignments } = event;

    this.cardService
      .assignResource(this.card, resource, clearAssignments)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {});
  }
}
