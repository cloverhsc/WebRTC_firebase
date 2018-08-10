import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WebrtclocalComponent } from './webrtclocal/webrtclocal.component';

import { environment } from './../environments/environment';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { MatButtonModule } from '@angular/material';

// my module
import { ViewerModule } from './viewer/viewer.module';
import { RemotecameraModule } from './remotecamera/remotecamera.module';

@NgModule({
  declarations: [
    AppComponent,
    WebrtclocalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    AngularFireModule.initializeApp(environment.firebase), // import firebase/app needed for everything
    AngularFirestoreModule,   // imports firebase/firestore, only needed for database features
    AngularFireAuthModule,    // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule,  // imports firebase/storage only needed for storage features
    ViewerModule,
    RemotecameraModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
