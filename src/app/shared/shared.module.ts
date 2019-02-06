import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './components/notification/notification.component';

// Libraries
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DirectiveModule } from './directives';
import { TDXAgilePipesModule } from './pipes';

// Components
import { ButtonComponent } from './components/button/button.component';
import { ExpandCollapseGlyphComponent } from './components/expand-collapse-glyph/expand-collapse-glyph.component';
import { FilterToolbarComponent } from './components/filter-toolbar/filter-toolbar.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { StoryPointIndicatorComponent } from './components/story-point-indicator/story-point-indicator.component';

@NgModule({
  declarations: [
    ButtonComponent,
    ExpandCollapseGlyphComponent,
    FilterToolbarComponent,
    LoadingSpinnerComponent,
    NotificationComponent,
    StoryPointIndicatorComponent,
  ],
  imports: [CommonModule, DirectiveModule, TDXAgilePipesModule.forRoot(), TooltipModule.forRoot()],
  exports: [
    DirectiveModule,
    TDXAgilePipesModule,
    ButtonComponent,
    ExpandCollapseGlyphComponent,
    FilterToolbarComponent,
    LoadingSpinnerComponent,
    NotificationComponent,
    StoryPointIndicatorComponent,
  ],
})
export class SharedModule {}
