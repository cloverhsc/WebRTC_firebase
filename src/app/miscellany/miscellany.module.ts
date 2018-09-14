import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MiscellanyRoutingModule } from './miscellany-routing.module';
import { TrycodeComponent } from './trycode/trycode.component';
import { MatButtonModule, MatSelectModule, MatFormFieldModule } from '@angular/material';
import { TryRTCPeerConnectionComponent } from './try-rtcpeer-connection/try-rtcpeer-connection.component';

@NgModule({
  imports: [
    CommonModule,
    MiscellanyRoutingModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  declarations: [TrycodeComponent, TryRTCPeerConnectionComponent]
})
export class MiscellanyModule { }
