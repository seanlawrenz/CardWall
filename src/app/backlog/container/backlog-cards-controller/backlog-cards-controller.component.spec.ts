import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SortablejsModule } from 'angular-sortablejs';

import { BacklogCardsControllerComponent, CardMovementTypes } from './backlog-cards-controller.component';
import { mockCard, mockList, mockCardBuilder } from '@app/test/data';
import { CardService } from '@app/app-services/card.service';
import { Card } from '@app/models';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { SignalRService } from '@app/app-services';
import { Actions } from '@ngrx/effects';
import { getActions } from '@app/test/mocks';

describe('BacklogCardControllerComponent', () => {
  let component: BacklogCardsControllerComponent;
  let fixture: ComponentFixture<BacklogCardsControllerComponent>;
  let cardSvc: CardService;
  let signalR: SignalRService;
  let mockEventFromSortable: { clone: { cardData: Card }; newIndex: number; oldIndex: number } = {
    clone: { cardData: null },
    newIndex: null,
    oldIndex: null,
  };
  let spy;
  let store;
  const mockCardFromMockList = Object.assign({}, mockCard, { listId: mockList.id, projectId: mockList.projectId, planId: mockList.planId });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BacklogCardsControllerComponent],
      imports: [SortablejsModule],
      providers: [
        {
          provide: CardService,
          useValue: {
            moveCardWithInSameList: jest.fn(() => ({ pipe: jest.fn(() => ({ subscribe: jest.fn() })) })),
            moveCardToListInSameBoard: jest.fn(() => ({ pipe: jest.fn(() => ({ subscribe: jest.fn() })) })),
          },
        },
        { provide: Actions, useFactory: getActions },
        { provide: SignalRService, useValue: { invoke: jest.fn() } },
        {
          provide: Store,
          useValue: { select: jest.fn(() => ({ pipe: jest.fn(() => ({ subscribe: jest.fn() })) })), dispatch: jest.fn(), pipe: jest.fn() },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacklogCardsControllerComponent);
    component = fixture.componentInstance;
    cardSvc = TestBed.get(CardService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cardMovement', () => {
    describe('START', () => {
      it('should add the card data to the event object on drag start', () => {
        const xtraCard = mockCardBuilder();
        const xtraCard2 = mockCardBuilder();
        component.cards = [xtraCard2, mockCardFromMockList, xtraCard];
        component.listInfo = { listId: mockList.id, projectId: mockList.projectId, planId: mockList.planId };
        mockEventFromSortable = { oldIndex: 1, newIndex: undefined, clone: { cardData: null } };
        fixture.detectChanges();

        component.cardMovement(mockEventFromSortable, CardMovementTypes.START);
        expect(mockEventFromSortable.clone.cardData).toEqual(mockCardFromMockList);
      });
    });

    describe('ADD card', () => {
      beforeEach(() => {
        component.listInfo = { listId: mockList.id, projectId: mockList.projectId, planId: mockList.planId };
        component.cards = [];
        mockEventFromSortable.clone.cardData = mockCardBuilder();
      });

      it('should update the dragCard data', () => {
        fixture.detectChanges();

        component.cardMovement(mockEventFromSortable, CardMovementTypes.ADD);
        expect(mockEventFromSortable.clone.cardData.listId).toEqual(mockList.id);
      });

      it('should update the planId data', () => {
        fixture.detectChanges();
        component.cardMovement(mockEventFromSortable, CardMovementTypes.ADD);

        expect(mockEventFromSortable.clone.cardData.planId).toEqual(mockList.planId);
      });

      it('should update the projectId data', () => {
        fixture.detectChanges();
        component.cardMovement(mockEventFromSortable, CardMovementTypes.ADD);

        expect(mockEventFromSortable.clone.cardData.projectId).toEqual(mockList.projectId);
      });
    });

    describe('END', () => {
      beforeEach(() => {
        store = TestBed.get(Store);
        signalR = TestBed.get(SignalRService);
        signalR.invoke = jest.fn(() => of({}));
        cardSvc = TestBed.get(CardService);
        component.listInfo = { listId: mockList.id, projectId: mockList.projectId, planId: mockList.planId };
      });
      it('should know if the card did not move', () => {
        // The <any> type is to allow a spyon private method
        component.cards = [];
        spy = jest.spyOn(<any>component, 'dragCardEnd');
        mockEventFromSortable = { newIndex: 0, oldIndex: 0, clone: { cardData: mockCardFromMockList } };

        component.cardMovement(mockEventFromSortable, CardMovementTypes.END);
        fixture.detectChanges();

        expect(spy).not.toHaveBeenCalled();
      });

      it('should tell if the card was moved within the same list (same list)', () => {
        spy = jest.spyOn(cardSvc, 'moveCardWithInSameList');
        component.cards = [mockCardFromMockList, mockCard];
        mockEventFromSortable = { newIndex: 1, oldIndex: 0, clone: { cardData: mockCardFromMockList } };

        component.cardMovement(mockEventFromSortable, CardMovementTypes.END);

        expect(spy).toHaveBeenCalledWith(component.cards, 1);
      });

      it('should tell if the card was moved within the same list (not same list)', () => {
        spy = jest.spyOn(cardSvc, 'moveCardWithInSameList');
        const mockCard2 = mockCardBuilder();
        component.cards = [mockCard2, mockCard];
        mockEventFromSortable = { newIndex: 1, oldIndex: 0, clone: { cardData: mockCard2 } };
        jest.spyOn(store, 'select').mockImplementationOnce(jest.fn(() => of({ cards: [] })));

        component.cardMovement(mockEventFromSortable, CardMovementTypes.END);

        expect(spy).not.toHaveBeenCalled();
        expect(signalR.invoke).not.toBeUndefined();
      });
    });
    describe('dragCardEnd', () => {
      beforeEach(() => {
        store = TestBed.get(Store);
        signalR = TestBed.get(SignalRService);
        signalR.invoke = jest.fn(() => of({}));
        component.listInfo = { listId: mockList.id, projectId: mockList.projectId, planId: mockList.planId };
      });
      it('should call moveCardWithInSameList if card was moved within list', () => {
        jest.spyOn(store, 'select').mockImplementationOnce(jest.fn(() => of({ cards: [] })));
        spy = jest.spyOn(cardSvc, 'moveCardWithInSameList');
        component.cards = [mockCard, mockCardFromMockList];
        component['dragCardEnd'](mockCardFromMockList, 0, 1);

        expect(spy).toHaveBeenCalledWith(component.cards, 0);
      });

      it('should call moveCardToListInSameBoard if moved to new list', () => {
        jest.spyOn(store, 'select').mockImplementationOnce(jest.fn(() => of({ cards: [] })));
        spy = jest.spyOn(cardSvc, 'moveCardToListInSameBoard').mockImplementationOnce(jest.fn(() => of({})));
        const moveSpy = jest.spyOn(cardSvc, 'moveCardWithInSameList');
        mockCard.listId = 1;
        mockCard.planId = mockList.planId;

        component['dragCardEnd'](mockCard, 0, 1);

        expect(spy).toHaveBeenCalled();
        expect(moveSpy).not.toHaveBeenCalled();
      });

      it('should know if the card was moved to a new project', () => {
        spy = jest.spyOn(cardSvc, 'moveCardWithInSameList');
        const moveSpy = jest.spyOn(cardSvc, 'moveCardToListInSameBoard');
        jest.spyOn(store, 'select').mockImplementationOnce(jest.fn(() => of({ cards: [] })));
        const signalRSpy = jest.spyOn(signalR, 'invoke').mockImplementationOnce(jest.fn(() => of({})));
        mockCard.listId = 0;
        mockCard.planId = 0;
        const originatedCard = { ...mockCard, listId: mockList.id, planId: mockList.planId, projectId: mockList.projectId };

        component['dragCardEnd'](mockCard, 0, 1);

        expect(spy).not.toHaveBeenCalled();
        expect(moveSpy).not.toHaveBeenCalled();
        expect(signalRSpy).toHaveBeenCalledWith('CardMoveRelativeTo', originatedCard, mockCard.projectId, 0, 0, 0);
      });
    });
  });
});
