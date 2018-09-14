import { TryRTCPeerConnectionComponent } from './try-rtcpeer-connection/try-rtcpeer-connection.component';
import { TrycodeComponent } from './trycode/trycode.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'miscellany',
    component: TrycodeComponent },
  { path: 'rtcconn',
    component: TryRTCPeerConnectionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MiscellanyRoutingModule { }
