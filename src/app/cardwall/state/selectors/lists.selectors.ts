import { createSelector } from '@ngrx/store';
import * as fromCardwall from '../reducer';

import { filter } from 'lodash';

export const getLists = createSelector(
  fromCardwall.getCardwallState,
  state => state.lists.lists,
);

export const isListSaving = createSelector(
  fromCardwall.getCardwallState,
  state => state.lists.saving,
);

export const getListsError = createSelector(
  fromCardwall.getCardwallState,
  state => state.lists.error,
);