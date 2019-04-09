import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Project, Plan, List } from '@app/models';

@Component({
  selector: 'td-copy-move-card-view',
  templateUrl: './copy-move-card-view.component.html',
  styleUrls: ['./copy-move-card-view.component.scss'],
})
export class CopyMoveCardViewComponent implements OnInit {
  @Input() projects: Project[];
  @Input() plans: Plan[];
  @Input() lists: List[];
  @Input() plansLoading: boolean;
  @Input() listsLoading: boolean;

  @Output() projectChanged = new EventEmitter<number>();
  @Output() planChanged = new EventEmitter<{ projectId: number; planId: number }>();
  @Output() closeCopyMoveSliderRequested = new EventEmitter<void>();

  form: FormGroup;

  constructor() {}

  ngOnInit() {
    this.setupForm();
  }

  projectUpdated() {
    const { projectID } = this.form.value;
    this.projectChanged.emit(projectID);
  }

  planUpdated() {
    const { projectID, planID } = this.form.value;
    this.planChanged.emit({ projectId: projectID, planId: planID });
  }

  close() {
    this.closeCopyMoveSliderRequested.emit();
  }

  submit() {}

  private setupForm() {
    this.form = new FormGroup({
      projectID: new FormControl('', Validators.required),
      planID: new FormControl('', Validators.required),
      listID: new FormControl(''),
    });
  }
}