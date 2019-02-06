import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';

// ngrx
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducer } from './state/backlog.reducer';
import { BacklogEffects } from './state/backlog.effects';

// Libraries
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// Container
import { BacklogBaseComponent } from './container/backlog-base.component';
import { AddBoardBaseComponent } from './container/add-board-base/add-board-base.component';

// Components
/* tslint:disable:max-line-length */
import { BacklogContainerComponent } from './components/backlog-container/backlog-container.component';
import { AddBoardDiagramComponent } from './components/backlog-container/add-board-diagram/add-board-diagram.component';
import { BacklogNavComponent } from './components/backlog-container/backlog-nav/backlog-nav.component';
import { BacklogMoveToolbarComponent } from './components/backlog-container/backlog-nav/backlog-move-toolbar/backlog-move-toolbar.component';
import { BoardsViewComponent } from './components/backlog-container/boards-view/boards-view.component';
import { BacklogLoaderComponent } from './components/backlog-loader/backlog-loader.component';
import { BacklogBoardHeaderComponent } from './components/backlog-container/boards-view/backlog-board-header/backlog-board-header.component';
import { BacklogListComponent } from './components/backlog-container/boards-view/backlog-list/backlog-list.component';
import { BacklogCardComponent } from './components/backlog-container/boards-view/backlog-card/backlog-card.component';

const backlogRoutes: Routes = [
  {
    path: '',
    component: BacklogBaseComponent,
    runGuardsAndResolvers: 'always',
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    RouterModule.forChild(backlogRoutes),
    StoreModule.forFeature('backlog', reducer),
    EffectsModule.forFeature([BacklogEffects]),
    SharedModule,
    TooltipModule,
  ],
  declarations: [
    BacklogBaseComponent,
    AddBoardDiagramComponent,
    AddBoardBaseComponent,
    BacklogContainerComponent,
    BacklogNavComponent,
    BacklogMoveToolbarComponent,
    BoardsViewComponent,
    BacklogLoaderComponent,
    BacklogBoardHeaderComponent,
    BacklogListComponent,
    BacklogCardComponent,
  ],
  exports: [BacklogBaseComponent],
})
export class BacklogModule {}
