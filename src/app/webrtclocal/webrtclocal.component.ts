import { AuthenService } from './../authen.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';


@Component({
  selector: 'app-webrtclocal',
  templateUrl: './webrtclocal.component.html',
  styleUrls: ['./webrtclocal.component.css'],
  providers: [AngularFireDatabase]
})
export class WebrtclocalComponent implements OnInit {

  public database: firebase.database.Reference;
  constructor(
    public afAuth: AngularFireAuth,
    public db: AngularFireDatabase,
    private router: Router
  ) { }

  ngOnInit() { }

  logout() {
    this.afAuth.auth.signOut().then(() => this.router.navigate(['']))
    .catch( err => console.log(err));
  }
}
