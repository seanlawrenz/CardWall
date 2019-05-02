import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

import * as subtasksActions from '../actions/subtasks.actions';

import { SignalRService } from '@app/app-services';
import { Card, SignalRResult, Subtask } from '@app/models';

@Injectable()
export class CardDetailsSubtasksEffects {
  constructor(private actions$: Actions, private signalR: SignalRService) {}

  @Effect()
  fetchSubtasks$: Observable<Action> = this.actions$.pipe(
    ofType(subtasksActions.CardDetailsSubtasksTypes.FETCH_SUBTASKS),
    switchMap((action: { payload: Card }) => {
      const {
        payload: { projectId, planId, id },
      } = action;
      return this.signalR.invoke('SubtaskList', projectId, planId, id).pipe(
        map((result: SignalRResult) => {
          if (result.isSuccessful) {
            return new subtasksActions.FetchSubtasksSuccess(result.item);
          } else {
            return new subtasksActions.FetchSubtasksError(result.message);
          }
        }),
        catchError(err => of(new subtasksActions.FetchSubtasksError(err))),
      );
    }),
  );

  @Effect()
  updateSubtask$: Observable<Action> = this.actions$.pipe(
    ofType(subtasksActions.CardDetailsSubtasksTypes.UPDATE_SUBTASK),
    switchMap((action: { payload: { subtask: Subtask; card: Card } }) => {
      const {
        payload: { subtask, card },
      } = action;
      return this.signalR.invoke('SubtaskUpdate', card.projectId, card.planId, card.id, subtask).pipe(
        map((result: SignalRResult) => {
          if (result.isSuccessful) {
            return new subtasksActions.UpdateSubtaskSuccess(subtask);
          } else {
            return new subtasksActions.UpdateSubtaskError(result.reason ? result.reason : result.message);
          }
        }),
        catchError(err => of(new subtasksActions.UpdateSubtaskError(err))),
      );
    }),
  );

  @Effect()
  reorderSubtask$: Observable<Action> = this.actions$.pipe(
    ofType(subtasksActions.CardDetailsSubtasksTypes.SET_SUBTASKS_ORDER),
    switchMap((action: { payload: { card: Card; subtask: Subtask; newIndex: number } }) => {
      const {
        payload: { card, subtask, newIndex },
      } = action;
      return this.signalR.invoke('SubtaskReorder', card.projectId, card.planId, card.id, subtask.ID, newIndex).pipe(
        map((result: SignalRResult) => {
          if (result.isSuccessful) {
            return new subtasksActions.SetSubtasksOrderSuccess();
          } else {
            return new subtasksActions.SetSubtasksOrderError(result.reason);
          }
        }),
        catchError(err => of(new subtasksActions.SetSubtasksOrderError(err))),
      );
    }),
  );

  @Effect()
  promoteSubtask$: Observable<Action> = this.actions$.pipe(
    ofType(subtasksActions.CardDetailsSubtasksTypes.PROMOTE_SUBTASK),
    switchMap((action: { payload: { card: Card; subtask: Subtask } }) => {
      const {
        payload: { card, subtask },
      } = action;
      return this.signalR.invoke('SubtaskPromote', subtask, card).pipe(
        map((result: SignalRResult) => {
          if (result.isSuccessful) {
            return new subtasksActions.PromoteSubtaskSuccess(subtask);
          } else {
            return new subtasksActions.PromoteSubtaskError(result.reason);
          }
        }),
        catchError(err => of(new subtasksActions.PromoteSubtaskError(err))),
      );
    }),
  );

  @Effect()
  addSubtask$: Observable<Action> = this.actions$.pipe(
    ofType(subtasksActions.CardDetailsSubtasksTypes.CREATE_SUBTASK),
    switchMap((action: { payload: { card: Card; subtask: Subtask } }) => {
      const {
        payload: { card, subtask },
      } = action;
      return this.signalR.invoke('SubtaskAdd', card.projectId, card.planId, card.id, subtask).pipe(
        map((result: SignalRResult) => {
          if (result.isSuccessful) {
            const newSubtask = { ...subtask, ID: result.item };
            return new subtasksActions.CreateSubtaskSuccess(newSubtask);
          } else {
            return new subtasksActions.CreateSubtaskError(result.reason);
          }
        }),
        catchError(err => of(new subtasksActions.CreateSubtaskError(err))),
      );
    }),
  );
}