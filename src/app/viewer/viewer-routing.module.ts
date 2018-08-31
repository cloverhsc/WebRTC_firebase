import { HomeComponent } from './../home/home.component';
import { AuthenService } from './../authen.service';
import { ViewerComponent } from './viewer/viewer.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'viewer',
    component: ViewerComponent,
    canActivate: [AuthenService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewerRoutingModule { }
