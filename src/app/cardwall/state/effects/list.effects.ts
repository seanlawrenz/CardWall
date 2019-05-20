import { Injectable } from '@angular/core';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

import * as cardwallActions from '../actions';

import { SignalRService } from '@app/app-services';
import { SignalRResult } from '@app/models';
import { standardErrorLang } from '@app/constants';

@Injectable()
export class CardwallListEffects {
  constructor(private actions$: Actions, private signalR: SignalRService) {}

  @Effect()
  listReorder$: Observable<Action> = this.actions$.pipe(
    ofType(cardwallActions.CardwallListActionTypes.REORDER_LISTS),
    switchMap((action: cardwallActions.ReorderLists) => {
      const {
        payload: {
          lists,
          resortedList: { projectId, planId },
        },
      } = action;
      const sortedIds: number[] = lists.map(list => list.id);

      return this.signalR.invoke('ListReorder', sortedIds, projectId, planId).pipe(
        map((result: SignalRResult) => {
          if (result.isSuccessful) {
            return new cardwallActions.ReorderListsSuccess();
          } else {
            return new cardwallActions.ReorderListsError({ message: result.message, reason: result.reason });
          }
        }),
        catchError(err => of(new cardwallActions.ReorderListsError({ message: 'Problem ordering Lists', reason: standardErrorLang }))),
      );
    }),
  );
}
