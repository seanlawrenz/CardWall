import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Card, CardOperationInfo, SignalRResult } from '@app/models';
import { SignalRService } from './signal-r.service';

import { getRelativeMoveCardId } from '@app/utils';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  dragCard: Card;
  constructor(private signalRService: SignalRService, private notifyService: NotificationService) {}

  moveCardToListInSameBoard(cards: Card[], listId: number, newIndex: number) {}

  moveCardWithInSameList(cards: Card[], newIndex): any {
    const { projectId, planId, listId, id } = this.dragCard;
    const relativeCardId: number = getRelativeMoveCardId(cards, this.dragCard, newIndex);
    this.signalRService
      .invoke('CardReorderRelativeTo', projectId, planId, listId, id, relativeCardId)
      .subscribe((response: SignalRResult) => {
        if (!response.isSuccessful) {
          this.notifyService.danger('Problem Reordering Card', response.reason ? response.reason : response.message);
        }
      });
  }
}