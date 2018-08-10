import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewerRoutingModule } from './viewer-routing.module';
import { ViewerComponent } from './viewer/viewer.component';

import { MatButtonModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    ViewerRoutingModule,
    MatButtonModule
  ],
  declarations: [ViewerComponent]
})
export class ViewerModule { }
