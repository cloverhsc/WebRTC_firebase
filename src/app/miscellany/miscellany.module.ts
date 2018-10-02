import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MiscellanyRoutingModule } from './miscellany-routing.module';
import { TrycodeComponent } from './trycode/trycode.component';
import { MatButtonModule, MatSelectModule, MatFormFieldModule,
MatInputModule } from '@angular/material';
import { TryRTCPeerConnectionComponent } from './try-rtcpeer-connection/try-rtcpeer-connection.component';
import { TryRtcdatachannelComponent } from './try-rtcdatachannel/try-rtcdatachannel.component';
import { SendMessageComponent } from './send-message/send-message.component';

@NgModule({
  imports: [
    CommonModule,
    MiscellanyRoutingModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [
    TrycodeComponent, TryRTCPeerConnectionComponent,
    TryRtcdatachannelComponent,
    SendMessageComponent]
})
export class MiscellanyModule { }
