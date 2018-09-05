import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MiscellanyRoutingModule } from './miscellany-routing.module';
import { TrycodeComponent } from './trycode/trycode.component';

@NgModule({
  imports: [
    CommonModule,
    MiscellanyRoutingModule
  ],
  declarations: [TrycodeComponent]
})
export class MiscellanyModule { }
