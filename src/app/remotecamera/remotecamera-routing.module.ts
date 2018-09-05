import { HomeComponent } from './../home/home.component';
import { AuthenService } from './../authen.service';
import { RemotecameraComponent } from './remotecamera/remotecamera.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'remotecamera',
    component: RemotecameraComponent,
    canActivate: [AuthenService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RemotecameraRoutingModule { }
