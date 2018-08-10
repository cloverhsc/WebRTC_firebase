import { RemotecameraComponent } from './remotecamera/remotecamera.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'remotecamera', component: RemotecameraComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RemotecameraRoutingModule { }
