import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Libraries
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DirectiveModule } from './directives';
import { ClipboardModule } from 'ngx-clipboard';
import { TDXAgilePipesModule } from './pipes';

// Components
import { ButtonComponent } from './components/button/button.component';
import { CardResourceIconsComponent } from './components/card-resource-icons/card-resource-icons.component';
import { EstimatedHoursComponent } from './components/estimated-hours/estimated-hours.component';
import { ExpandCollapseGlyphComponent } from './components/expand-collapse-glyph/expand-collapse-glyph.component';
import { FilterToolbarComponent } from './components/filter-toolbar/filter-toolbar.component';
import { GripComponent } from './components/grip/grip.component';
import { IdCopyButtonComponent } from './components/id-copy-button/id-copy-button.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { OptionSidebarContainerComponent } from './components/option-sidebar-container/option-sidebar-container.component';
import { PriorityComponent } from './components/priority/priority.component';
import { ProfileImageComponent } from './components/profile-image/profile-image.component';
import { SlideInViewContainerComponent } from './components/slide-in-view-container/slide-in-view-container.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { StoryPointIndicatorComponent } from './components/story-point-indicator/story-point-indicator.component';
import { SubtasksIconComponent } from './components/subtasks-icon/subtasks-icon.component';
import { ToolbarResourcesComponent } from './components/toolbar-resources/toolbar-resources.component';
import { TotalsUiComponent } from './components/totals-ui/totals-ui.component';

@NgModule({
  declarations: [
    ButtonComponent,
    EstimatedHoursComponent,
    ExpandCollapseGlyphComponent,
    FilterToolbarComponent,
    LoadingSpinnerComponent,
    SpinnerComponent,
    StoryPointIndicatorComponent,
    GripComponent,
    SubtasksIconComponent,
    CardResourceIconsComponent,
    ProfileImageComponent,
    OptionSidebarContainerComponent,
    ToolbarResourcesComponent,
    TotalsUiComponent,
    IdCopyButtonComponent,
    PriorityComponent,
    SlideInViewContainerComponent,
  ],
  imports: [
    CommonModule,
    DirectiveModule,
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,
    TDXAgilePipesModule.forRoot(),
    TooltipModule.forRoot(),
  ],
  exports: [
    DirectiveModule,
    TDXAgilePipesModule,
    ButtonComponent,
    CardResourceIconsComponent,
    EstimatedHoursComponent,
    ExpandCollapseGlyphComponent,
    FilterToolbarComponent,
    GripComponent,
    IdCopyButtonComponent,
    LoadingSpinnerComponent,
    OptionSidebarContainerComponent,
    PriorityComponent,
    ProfileImageComponent,
    SlideInViewContainerComponent,
    SpinnerComponent,
    StoryPointIndicatorComponent,
    SubtasksIconComponent,
    ToolbarResourcesComponent,
    TotalsUiComponent,
  ],
})
export class SharedModule {}
