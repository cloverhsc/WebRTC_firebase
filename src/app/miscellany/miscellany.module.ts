import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MiscellanyRoutingModule } from './miscellany-routing.module';
import { TrycodeComponent } from './trycode/trycode.component';
import { MatButtonModule, MatSelectModule, MatFormFieldModule,
MatInputModule, MatListModule } from '@angular/material';
import { TryRTCPeerConnectionComponent } from './try-rtcpeer-connection/try-rtcpeer-connection.component';
import { TryRtcdatachannelComponent } from './try-rtcdatachannel/try-rtcdatachannel.component';
import { SendMessageComponent } from './send-message/send-message.component';
import { MediaWDataComponent } from './media-w-data/media-w-data.component';

@NgModule({
  imports: [
    CommonModule,
    MiscellanyRoutingModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatListModule
  ],
  declarations: [
    TrycodeComponent, TryRTCPeerConnectionComponent,
    TryRtcdatachannelComponent,
    SendMessageComponent,
    MediaWDataComponent]
})
export class MiscellanyModule { }
