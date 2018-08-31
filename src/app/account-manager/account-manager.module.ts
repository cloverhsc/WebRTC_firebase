import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AccountManagerRoutingModule } from './account-manager-routing.module';
import { ProfileComponent } from './profile/profile.component';

import { MatButtonModule, MatInputModule, MatFormFieldModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    AccountManagerRoutingModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ],
  declarations: [ProfileComponent]
})
export class AccountManagerModule { }
