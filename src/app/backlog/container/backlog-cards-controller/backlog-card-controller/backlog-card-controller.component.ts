import { Component, OnInit, Input } from '@angular/core';
import { Card } from '@app/models';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { fromRoot } from '@app/store';
import * as fromBacklog from '@app/backlog/state';
import * as cardActions from '@app/store/actions/card.actions';

@Component({
  selector: 'td-backlog-card-controller',
  templateUrl: './backlog-card-controller.component.html',
  styleUrls: ['./backlog-card-controller.component.scss'],
})
export class BacklogCardControllerComponent implements OnInit {
  @Input() card: Card;
  @Input() isOdd: boolean;

  isCardSelected = false;

  // UI Settings
  showEstimateHours$: Observable<boolean>;
  showStoryPoints$: Observable<boolean>;

  constructor(private store: Store<fromBacklog.BacklogState>, private appStore: Store<fromRoot.State>) {}

  ngOnInit() {
    this.showEstimateHours$ = this.store.pipe(select(fromBacklog.showEstimateHours));
    this.showStoryPoints$ = this.store.pipe(select(fromBacklog.showStoryPoints));

    this.appStore.pipe(select(fromRoot.getSelectedCard)).subscribe(card => {
      if (card === undefined) {
        this.isCardSelected = false;
        return;
      }
      this.isCardSelected = card.id === this.card.id;
    });
  }

  selectCard() {
    this.appStore.dispatch(new cardActions.CardSelected(this.card));
  }
}