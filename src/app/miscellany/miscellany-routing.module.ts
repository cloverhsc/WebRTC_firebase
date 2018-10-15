import { MediaWDataComponent } from './media-w-data/media-w-data.component';
import { SendMessageComponent } from './send-message/send-message.component';
import { TryRtcdatachannelComponent } from './try-rtcdatachannel/try-rtcdatachannel.component';
import { TryRTCPeerConnectionComponent } from './try-rtcpeer-connection/try-rtcpeer-connection.component';
import { TrycodeComponent } from './trycode/trycode.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'miscellany',
    component: TrycodeComponent },
  { path: 'rtcconn',
    component: TryRTCPeerConnectionComponent
  },
  { path: 'exdata',
    component: TryRtcdatachannelComponent
  },
  {
    path: 'chatroom',
    component: SendMessageComponent
  },
  {
    path: 'room',
    component: MediaWDataComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MiscellanyRoutingModule { }
