import { TrycodeComponent } from './miscellany/trycode/trycode.component';
import { ProfileComponent } from './account-manager/profile/profile.component';
import { RemotecameraComponent } from './remotecamera/remotecamera/remotecamera.component';
import { ViewerComponent } from './viewer/viewer/viewer.component';
import { AuthenService } from './authen.service';
import { HomeComponent } from './home/home.component';
import { WebrtclocalComponent } from './webrtclocal/webrtclocal.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'webrtc',
    component: WebrtclocalComponent,
    canActivate: [AuthenService]
  },
  { path: '', component: HomeComponent},
 /*  {
    path: 'viewer',
    component: ViewerComponent,
    canActivate: [AuthenService]
  },
  {
    path: 'remotecamera',
    component: RemotecameraComponent,
    canActivate: [AuthenService]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthenService]
  },
  {
    path: 'miscellany',
    component: TrycodeComponent
  }, */
  // { path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
