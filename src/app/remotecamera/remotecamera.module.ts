import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RemotecameraRoutingModule } from './remotecamera-routing.module';
import { RemotecameraComponent } from './remotecamera/remotecamera.component';

import { MatButtonModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    RemotecameraRoutingModule,
    MatButtonModule
  ],
  declarations: [RemotecameraComponent]
})
export class RemotecameraModule { }
