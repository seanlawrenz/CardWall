import { Injectable } from '@angular/core';
import { BoardService, SignalRService } from '@app/app-services';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, Observable, empty } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, mapTo, switchMap, exhaustMap } from 'rxjs/operators';

import { fromRoot } from '@app/store';

import { ShowLoader, HideLoader } from '@app/store/actions/loading.actions';

import * as fromBacklog from '../state';
import * as backlogActions from './backlog.actions';

import { PlanIdentifier, SignalRResult, Plan } from '@app/models';

// Loading
type showLoadingTypes = backlogActions.GetAvailableBoards;
type hideLoadingTypes = backlogActions.GetAvailableBoardsSuccess | backlogActions.GetAvailableBoardsFail;

const showLoadingActions = [backlogActions.BacklogActionTypes.GET_AVAILABLE_BOARDS];
const hideLoadingActions = [
  backlogActions.BacklogActionTypes.GET_AVAILABLE_BOARDS_SUCCESS,
  backlogActions.BacklogActionTypes.GET_AVAILABLE_BOARDS_FAIL,
];

@Injectable()
export class BacklogEffects {
  constructor(
    private actions$: Actions,
    private signalRService: SignalRService,
    private boardService: BoardService,
    private store: Store<fromRoot.State>,
  ) {}

  @Effect()
  showLoader$: Observable<Action> = this.actions$.pipe(
    ofType<showLoadingTypes>(...showLoadingActions),
    map(() => new ShowLoader()),
  );

  @Effect()
  hideLoader$: Observable<Action> = this.actions$.pipe(
    ofType<hideLoadingTypes>(...hideLoadingActions),
    map(() => new HideLoader()),
  );

  @Effect()
  loadPlansIdentifiers$ = this.actions$.pipe(
    ofType(backlogActions.BacklogActionTypes.GET_AVAILABLE_BOARDS),
    withLatestFrom(this.store.select(fromBacklog.getBoards), (action, boards) => {
      if (boards.length > 0) {
        return boards.map(board => board.id);
      } else {
        return [];
      }
    }),
    mergeMap(boards => {
      return this.signalRService.invoke('AvailableCardWallList', boards).pipe(
        map((res: SignalRResult) => {
          const plans: PlanIdentifier[] = res.item;
          return new backlogActions.GetAvailableBoardsSuccess(plans);
        }),
        catchError(err => of(new backlogActions.GetAvailableBoardsFail(err))),
      );
    }),
  );

  @Effect()
  loadPlansOnParams$ = this.actions$.pipe(
    ofType(backlogActions.BacklogActionTypes.GET_BOARDS_IN_PARAMS),
    withLatestFrom(this.store.select(fromRoot.getRouterState), (action, router) => {
      const {
        state: {
          queryParams: { boards },
        },
      } = router;
      return {
        boards,
      };
    }),
    exhaustMap(payload => {
      return this.boardService.getBoardsFromParams(payload.boards).pipe(
        map((plans: Plan[]) => new backlogActions.GetBoardsSuccess(plans)),
        catchError(err => of(new backlogActions.GetBoardsError(err))),
      );
    }),
  );

  @Effect()
  loadPlans = this.actions$.pipe(
    ofType(backlogActions.BacklogActionTypes.ADD_BOARD),
    withLatestFrom(this.store.select(fromBacklog.getBoards), (action: { payload: string }, plans: Plan[]) => ({
      plansToAdd: action.payload,
      currentlyLoadedPlans: plans,
    })),
    mergeMap(payload =>
      this.boardService
        .getBoardsFromParams(payload.plansToAdd)
        .pipe(map((plansReturnFromServer: Plan[]) => new backlogActions.GetBoardsSuccess(plansReturnFromServer))),
    ),
  );

  @Effect()
  removeBoard$ = this.actions$.pipe(
    ofType(backlogActions.BacklogActionTypes.REMOVE_BOARD),
    withLatestFrom(this.store.select(fromBacklog.getBoards), (action: { payload: { planId: number }; type: string }, plans: Plan[]) => {
      const {
        payload: { planId },
      } = action;
      return plans.filter(plan => plan.id !== planId);
    }),
    map(plans => new backlogActions.GetBoardsSuccess(plans)),
  );
}
