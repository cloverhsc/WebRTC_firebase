import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';

import { AuthenService } from './../authen.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [ AngularFireDatabase]
})
export class HomeComponent implements OnInit {

  public RegOrSignIn: FormGroup ;
  public errorCode: string;
  public errorMessage: string;
  private credential: string;
  public database: firebase.database.Reference;

  private GoogleProvider = new firebase.auth.GoogleAuthProvider();
  constructor(
    private fb: FormBuilder,
    public afAuth: AngularFireAuth,
    private auth: AuthenService,
    private router: Router,
    public db: AngularFireDatabase
  ) {  }

  ngOnInit() {
    this.RegOrSignIn = this.fb.group({
      email: ['', Validators.required],
      passwd: ['', [Validators.required, Validators.minLength(4)]]
    });

    this.afAuth.auth.useDeviceLanguage();

    this.CheckSignInAndRedirc();
  }

  onSubmit() {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then( () => {
      return this.afAuth.auth.signInWithEmailAndPassword(
        this.RegOrSignIn.value.email,
        this.RegOrSignIn.value.passwd);
    })
    .then(credential => {
      // sign in success.
      console.log(credential.user.uid);
      if (credential.user.uid) {
        const fireDB = this.db.database.ref(
          'users/' + credential.user.uid);

        fireDB.once('value').then( snapshot => {
          const email = (snapshot.val() && snapshot.val().email);
          console.log(`email: ${email}`);
          if (!email) {
            fireDB.set({
              name: credential.user.displayName || '',
              email: credential.user.email || '',
              avatar: credential.user.photoURL || ''
            })
            .catch( err => {
              this.errorCode = err.code;
              this.errorMessage = err.message;
            });
          }

        })
        .catch( err => {
          this.errorCode = err.code;
          this.errorMessage = err.message;
        });
      }
    })
    .then( () => {
      this.router.navigate(['webrtc']);
    })
    .catch( err => {
      this.errorCode = err.code;
      this.errorMessage = err.message;
    });
  }

  Register() {
    firebase.auth().createUserWithEmailAndPassword(
      this.RegOrSignIn.value.email,
      this.RegOrSignIn.value.passwd
    )
    .then( credential => {
      // sign in success
      console.log(credential.user.uid);
      if (credential.user.uid) {
        const fireDB = this.db.database.ref('users/' + credential.user.uid);
        fireDB.once('value').then( snapshot => {
          const email = (snapshot.val() && snapshot.val().email);
          if (!email) {
            fireDB.set({
              name: credential.user.displayName || '',
              email: credential.user.email || '',
              avatar: credential.user.photoURL || ''
            })
            .catch( err => {
              this.errorCode = err.code;
              this.errorMessage = err.message;
            });
          }
        })
        .catch( err => {
          this.errorCode = err.code;
          this.errorMessage = err.message;
        });
      }
    })
    .then(() => {
        this.router.navigate(['webrtc']);
    })
    .catch( err => {
      this.errorCode = err.code;
      this.errorMessage = err.message;
    });
  }

  /**
   * Oauth:
   * Google account SignIn or Register.
   * Modify the Auth state persistence to SESSION.
   * SESSION: Indicates that the state will only persist
   *          in the current session or tab, and will be cleared
   *          when the tab or window in which the user authenticated
   *          is closed. Applies only to web apps.
   */
  signInWithGoogle() {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => this.afAuth.auth.signInWithPopup(this.GoogleProvider))
      .then(credential => {
        // sign in success.
        console.log(credential.user.uid);
        if (credential.user.uid) {
          const fireDB = this.db.database.ref(
            'users/' + credential.user.uid);

          fireDB.once('value').then(snapshot => {
            const email = (snapshot.val() && snapshot.val().email);
            console.log(`email: ${email}`);
            if (!email) {
              fireDB.set({
                name: credential.user.displayName || '',
                email: credential.user.email || '',
                avatar: credential.user.photoURL || ''
              })
                .catch(err => {
                  this.errorCode = err.code;
                  this.errorMessage = err.message;
                });
            }

          })
            .catch(err => {
              this.errorCode = err.code;
              this.errorMessage = err.message;
            });
        }
      })
      .then(() => {
        this.router.navigate(['webrtc']);
      })
      .catch(err => {
        this.errorCode = err.code;
        this.errorMessage = err.message;
    });
  }

  /**
   * Oauth:
   * FaceBook account SignIn or Register.
   * Modify the Auth state persistence to SESSION.
   * SESSION: Indicates that the state will only persist
   *          in the current session or tab, and will be cleared
   *          when the tab or window in which the user authenticated
   *          is closed. Applies only to web apps.
   */
  signInWithFB() {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => {
        return this.afAuth.auth.signInWithPopup(
          new firebase.auth.FacebookAuthProvider());
      })
      .then(credential => {
        // sign in success.
        console.log(credential.user.uid);
        if (credential.user.uid) {
          const fireDB = this.db.database.ref(
            'users/' + credential.user.uid);

          fireDB.once('value').then(snapshot => {
            const email = (snapshot.val() && snapshot.val().email);
            console.log(`email: ${email}`);
            if (!email) {
              fireDB.set({
                name: credential.user.displayName || '',
                email: credential.user.email || '',
                avatar: credential.user.photoURL || ''
              })
                .catch(err => {
                  this.errorCode = err.code;
                  this.errorMessage = err.message;
                });
            }

          })
            .catch(err => {
              this.errorCode = err.code;
              this.errorMessage = err.message;
            });
        }
      })
      .then(() => {
        this.router.navigate(['webrtc']);
      })
      .catch(err => {
        this.errorCode = err.code;
        this.errorMessage = err.message;
      });
  }

  checkStatus() {
    this.afAuth.auth.onAuthStateChanged( user => {
      if (user) {
        console.log(true);
      } else {
        console.log(false);
      }
    });
  }

  CheckSignInAndRedirc() {
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.router.navigate(['webrtc']);
      } else {
        this.router.navigate(['']);
      }
    });
  }
}
