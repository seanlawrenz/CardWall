import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import { BoardsControllerComponent } from './boards-controller.component';
import { mockBoard } from '@app/test/data';

describe('BoardsControllerComponent', () => {
  let component: BoardsControllerComponent;
  let fixture: ComponentFixture<BoardsControllerComponent>;
  let text;
  let location: SpyLocation;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BoardsControllerComponent],
      providers: [{ provide: Location, useClass: SpyLocation }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardsControllerComponent);
    component = fixture.componentInstance;
    component.plans = [];
    location = TestBed.get(Location);
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
    fixture.detectChanges();
    text = fixture.debugElement.query(By.css('.alert-warning'));
    expect(text.nativeElement.textContent).toContain('Cannot Get Board');
  });

  it('should change the location on sortPlans', () => {
    location.setInitialPath('/backlog');
    const extraMockBoard = Object.assign({}, mockBoard, { id: 123 });
    component.plans = [mockBoard, extraMockBoard];

    fixture.detectChanges();
    component.sortPlans();
    console.log('path is', location.path());
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
});
