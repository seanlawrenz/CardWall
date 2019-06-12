import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Card, Board, Resources } from '@app/models';
import { ConfigService } from '@app/app-services';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'td-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss'],
})
export class CardViewComponent implements OnInit {
  @Input() card: Card;
  @Input() board: Board;
  @Input() isSelected: boolean;
  @Input() isOwnerSelected: boolean;

  @Output() archiveOrDeleteCardRequested = new EventEmitter<Card>();
  @Output() cardSelectedRequested = new EventEmitter<{ card: Card; element: ElementRef }>();
  @Output() addResourceRequested = new EventEmitter<{ card: Card; resource: Resources; clearAssignments: boolean }>();

  @ViewChild('cardElement') cardElement: ElementRef;
  @ViewChild('archivePop') archivePopoverControl;
  @ViewChild('deletePop') deletePopoverControl;

  isInMyWork = false;
  canUpdate: boolean;
  canDeleteCards: boolean;

  isHighlighted = false;

  constructor(private config: ConfigService, private router: Router) {}

  ngOnInit() {
    this.setPermissions();
  }

  getCardStyle(): string {
    if (this.isSelected) {
      return 'tdNg-card-selected white-text';
    }

    const cardStyle = `tdNg-card-color-${this.card.cssClass}`;

    if (this.isOwnerSelected) {
      return `${cardStyle} owner-selected`;
    }

    return cardStyle;
  }

  routeToEditCard() {
    const url = `cardwall/project/${this.card.projectId}/board/${this.card.planId}/card/${this.card.id}`;
    this.router.navigate([url]);
  }

  archiveCard() {
    if (this.canUpdate) {
      this.archiveOrDeleteCardRequested.emit(this.card);
    }

    this.archivePopoverControl.hide();
  }

  deleteCard() {
    if (this.canDeleteCards) {
      this.archiveOrDeleteCardRequested.emit(this.card);
    }

    this.deletePopoverControl.hide();
  }

  closeArchivePopover() {
    this.archivePopoverControl.hide();
  }

  closeDeletePopover() {
    this.deletePopoverControl.hide();
  }

  cardSelected() {
    this.cardSelectedRequested.emit({ card: this.card, element: this.cardElement });
  }

  onResourceDrop(event: { resource: Resources; clearAssignments: boolean }) {
    const { resource, clearAssignments } = event;
    this.addResourceRequested.emit({ card: this.card, resource, clearAssignments });
  }

  private setPermissions() {
    this.isInMyWork = this.board.myWorkTaskIDs.find(i => i === this.card.id) && this.card.listId !== 0;
    this.canDeleteCards = this.config.config.CanDeleteTasks;
    if (this.config.config.CanUpdateTasks) {
      this.canUpdate = true;
    } else {
      this.canUpdate =
        this.config.config.CanUpdateMyTasksOnly &&
        !isNullOrUndefined(this.card.owners.find((o: Resources) => o.uid === this.config.config.UID));
    }
  }
}
