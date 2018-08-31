import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WebrtclocalComponent } from './webrtclocal/webrtclocal.component';

import { environment } from './../environments/environment';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { MatButtonModule,
  MatInputModule,
  MatFormFieldModule} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// my module
import { ViewerModule } from './viewer/viewer.module';
import { RemotecameraModule } from './remotecamera/remotecamera.module';
import { AccountManagerModule } from './account-manager/account-manager.module';

import { HomeComponent } from './home/home.component';


@NgModule({
  declarations: [
    AppComponent,
    WebrtclocalComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase), // import firebase/app needed for everything
    AngularFirestoreModule,   // imports firebase/firestore, only needed for database features
    AngularFireAuthModule,    // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule,  // imports firebase/storage only needed for storage features
    ViewerModule,
    RemotecameraModule,
    AccountManagerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
