import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import { BoardsControllerComponent } from './boards-controller.component';
import { mockBoard, mockBoardBuilder, mockListBuilder, mockCardBuilder, mockResource } from '@app/test/data';

import { Store } from '@ngrx/store';
import * as backlogActions from '../../state/actions';
import { of } from 'rxjs';
import { Resources } from '@app/models';

const unassigned: Resources = {
  isPlaceholder: false,
  referenceId: -1,
  name: 'Unassigned',
  uid: '00000000-0000-0000-0000-000000000000',
  email: '',
  firstName: '',
  lastName: '',
  profilePicturePath: null,
  permissions: false,
};

const placeholder: Resources = {
  isPlaceholder: true,
  referenceId: -2,
  name: 'Resource Placeholders',
  firstName: 'Resource',
  lastName: 'Placeholders',
  uid: '00000000-0000-0000-0000-000000000000',
  profilePicturePath: 'DoesNotExist',
  permissions: false,
  email: '',
};

describe('BoardsControllerComponent', () => {
  let component: BoardsControllerComponent;
  let fixture: ComponentFixture<BoardsControllerComponent>;
  let text;
  let location: SpyLocation;
  let action;
  let spy;
  let store;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BoardsControllerComponent],
      providers: [
        { provide: Location, useClass: SpyLocation },
        { provide: Store, useValue: { dispatch: jest.fn(), select: jest.fn(() => ({ pipe: jest.fn(() => ({ subscribe: jest.fn() })) })) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      // Dumb dumb Angular BS.
      // It is being confused on the async for the class add so we have to add the component with out the async pipe
      .overrideComponent(BoardsControllerComponent, {
        remove: {
          templateUrl: './boards-controller.component.html',
        },
        add: {
          templateUrl: './boards-controller.for-testing.html',
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardsControllerComponent);
    component = fixture.componentInstance;
    component.plans = [];
    location = TestBed.get(Location);
    store = TestBed.get(Store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show to add existing card walls if no boards selected', () => {
    text = fixture.debugElement.query(By.css('.alert-primary'));
    expect(text.nativeElement.textContent).toContain('No Card Walls have been selected');
  });

  it('should show a warning for boards that failed', () => {
    const failedMockBoard = Object.assign({}, mockBoard, {
      erroredDuringFetching: true,
      message: 'Cannot Get Board',
      reason: 'You do not have access to this project',
    });
    component.plans = [failedMockBoard, mockBoard];
    component.ngOnChanges({
      plans: { firstChange: false, currentValue: [failedMockBoard, mockBoard], previousValue: [], isFirstChange: () => false },
    });
    fixture.detectChanges();
    text = fixture.debugElement.query(By.css('.alert-warning'));
    expect(text.nativeElement.textContent).toContain('Cannot Get Board');
  });

  describe('sortPlans', () => {
    it('should change the location on sortPlans', () => {
      location.setInitialPath('/backlog');
      const extraMockBoard = Object.assign({}, mockBoard, { id: 123 });
      component.plans = [mockBoard, extraMockBoard];

      fixture.detectChanges();
      component.sortPlans();
      let test = location.isCurrentPathEqualTo(
        `/backlog?boards=${mockBoard.projectId}_${mockBoard.id},${extraMockBoard.projectId}_${extraMockBoard.id}`,
      );
      expect(test).toBeTruthy();

      component.plans = [extraMockBoard, mockBoard];
      component.sortPlans();

      test = location.isCurrentPathEqualTo(
        `/backlog?boards=${extraMockBoard.projectId}_${extraMockBoard.id},${mockBoard.projectId}_${mockBoard.id}`,
      );
      expect(test).toBeTruthy();
    });

    it('should dispatch ReorderPlans', () => {
      action = new backlogActions.ReorderPlans([mockBoard]);
      spy = jest.spyOn(store, 'dispatch');
      component.plans = [mockBoard];

      component.sortPlans();

      expect(spy).toHaveBeenCalledWith(action);
    });
  });

  describe('searchCards', () => {
    const mockPlan1 = mockBoardBuilder();
    const mockPlan2 = mockBoardBuilder();

    const mockList1 = mockListBuilder();
    const mockList2 = mockListBuilder();

    const mockCard1 = mockCardBuilder();
    mockCard1.name = 'y';
    const mockCard2 = { ...mockCard1, name: 'test', tags: ['test'] };
    const mockCard3 = { ...mockCard1, name: 'testing', tags: ['blah'] };
    const mockCard4 = { ...mockCard1, name: 'x' };

    mockPlan1.lists = [mockList1];
    mockPlan2.lists = [mockList2];
    mockList1.cards = [mockCard1, mockCard2];
    mockList2.cards = [mockCard3, mockCard4];

    beforeEach(() => {
      component.plans = [mockPlan1, mockPlan2];
      component.ngOnChanges({
        plans: { firstChange: false, currentValue: [mockPlan1, mockPlan2], previousValue: [], isFirstChange: () => false },
      });
    });

    it('should have filteredPlans equal to plans', () => {
      expect(component.filteredPlans).toEqual(component.plans);
    });

    it('should filter the plans', () => {
      const expected = component['searchCards']([mockPlan1, mockPlan2], 'test');

      const expectedList1 = { ...mockList1, cards: [mockCard2] };
      const expectedList2 = { ...mockList2, cards: [mockCard3] };
      const expectedMockPlan1 = { ...mockPlan1, lists: [expectedList1] };
      const expectedMockPlan2 = { ...mockPlan2, lists: [expectedList2] };
      expect(expected).toEqual([expectedMockPlan1, expectedMockPlan2]);
    });

    it('should return all the plans if the term is blank', () => {
      const testPlans = component['searchCards']([mockPlan1, mockPlan2], '');
      expect(testPlans).toEqual([mockPlan1, mockPlan2]);
    });

    it('should filter via tags if the search starts with #', () => {
      const expected = component['searchCards']([mockPlan1, mockPlan2], '#te');

      const expectedList1 = { ...mockList1, cards: [mockCard2] };
      const expectedList2 = { ...mockList2, cards: [] };
      const expectedMockPlan1 = { ...mockPlan1, lists: [expectedList1] };
      const expectedMockPlan2 = { ...mockPlan2, lists: [expectedList2] };
      expect(expected).toEqual([expectedMockPlan1, expectedMockPlan2]);
    });
  });

  describe('searchResources', () => {
    const mockPlan1 = mockBoardBuilder();
    const mockPlan2 = mockBoardBuilder();

    const mockList1 = mockListBuilder();
    const mockList2 = mockListBuilder();

    const mockCard1 = mockCardBuilder();
    mockCard1.name = 'y';
    const mockCard2 = { ...mockCard1, name: 'test', tags: ['test'], owners: [] };
    const mockCard3 = { ...mockCard1, name: 'testing', owners: [mockResource] };
    const mockCard4 = { ...mockCard1, name: 'x', owners: null };

    mockPlan1.lists = [mockList1];
    mockPlan2.lists = [mockList2];
    mockList1.cards = [mockCard1, mockCard2];
    mockList2.cards = [mockCard3, mockCard4];

    beforeEach(() => {
      component.plans = [mockPlan1, mockPlan2];
      component.ngOnChanges({
        plans: { firstChange: false, currentValue: [mockPlan1, mockPlan2], previousValue: [], isFirstChange: () => false },
      });
    });

    it('should have filterPlans equal to plans', () => {
      expect(component.filteredPlans).toEqual(component.plans);
    });

    it('should filter out cards that have the resource selected', () => {
      const expected = component['searchCards']([mockPlan1, mockPlan2], [mockResource]);

      const expectedList1 = { ...mockList1, cards: [] };
      const expectedList2 = { ...mockList2, cards: [mockCard3] };
      const expectedMockPlan1 = { ...mockPlan1, lists: [expectedList1] };
      const expectedMockPlan2 = { ...mockPlan2, lists: [expectedList2] };
      expect(expected).toEqual([expectedMockPlan1, expectedMockPlan2]);
    });

    it('should return all the plans if no resources selected', () => {
      const testPlans = component['searchCards']([mockPlan1, mockPlan2], []);
      expect(testPlans).toEqual([mockPlan1, mockPlan2]);
    });

    it('should return the unassigned cards', () => {
      const expected = component['searchCards']([mockPlan1, mockPlan2], [unassigned]);

      const expectedList1 = { ...mockList1, cards: [mockCard1, mockCard2] };
      const expectedList2 = { ...mockList2, cards: [mockCard4] };
      const expectedMockPlan1 = { ...mockPlan1, lists: [expectedList1] };
      const expectedMockPlan2 = { ...mockPlan2, lists: [expectedList2] };

      expect(expected).toEqual([expectedMockPlan1, expectedMockPlan2]);
    });

    it('should return unassigned as well as a resource', () => {
      const expected = component['searchCards']([mockPlan1, mockPlan2], [unassigned, mockResource]);

      expect(expected).toEqual([mockPlan1, mockPlan2]);
    });
  });

  describe('searching both', () => {
    const mockPlan1 = mockBoardBuilder();
    const mockPlan2 = mockBoardBuilder();

    const mockList1 = mockListBuilder();
    const mockList2 = mockListBuilder();

    const mockCard1 = mockCardBuilder();
    mockCard1.name = 'y';
    const mockCard2 = { ...mockCard1, name: 'test', tags: ['test'] };
    const mockCard3 = { ...mockCard1, name: 'testing', tags: ['blah'], owners: [mockResource] };
    const mockCard4 = { ...mockCard1, name: 'x', owners: [mockResource] };

    mockPlan1.lists = [mockList1];
    mockPlan2.lists = [mockList2];
    mockList1.cards = [mockCard1, mockCard2];
    mockList2.cards = [mockCard3, mockCard4];

    beforeEach(() => {
      component.plans = [mockPlan1, mockPlan2];
      component.ngOnChanges({
        plans: { firstChange: false, currentValue: [mockPlan1, mockPlan2], previousValue: [], isFirstChange: () => false },
      });
    });

    it('should filter by both', () => {
      component.searchTerm = 'test';
      const expected = component['searchCards']([mockPlan1, mockPlan2], [mockResource]);
      const expectedList1 = { ...mockList1, cards: [] };
      const expectedList2 = { ...mockList2, cards: [mockCard3] };
      const expectedMockPlan1 = { ...mockPlan1, lists: [expectedList1] };
      const expectedMockPlan2 = { ...mockPlan2, lists: [expectedList2] };

      expect(expected).toEqual([expectedMockPlan1, expectedMockPlan2]);
    });

    it('should reset to original plans if both are reset', () => {
      component['searchCards']([mockPlan1, mockPlan2], []);

      expect(component.filteredPlans).toEqual([mockPlan1, mockPlan2]);
    });
  });
});
