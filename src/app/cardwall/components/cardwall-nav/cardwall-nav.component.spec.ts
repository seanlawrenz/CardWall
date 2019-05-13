import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@app/shared/shared.module';

import { CardwallNavComponent } from './cardwall-nav.component';
import { mockBoard } from '@app/test/data';

describe('CardwallNavComponent', () => {
  let component: CardwallNavComponent;
  let fixture: ComponentFixture<CardwallNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CardwallNavComponent],
      imports: [SharedModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardwallNavComponent);
    component = fixture.componentInstance;
    component.board = mockBoard;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
