import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MiscellanyRoutingModule } from './miscellany-routing.module';
import { TrycodeComponent } from './trycode/trycode.component';
import { MatButtonModule, MatSelectModule, MatFormFieldModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MiscellanyRoutingModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  declarations: [TrycodeComponent]
})
export class MiscellanyModule { }
