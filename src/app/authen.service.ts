import { Injectable } from '@angular/core';
import { CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';
import { take, map, tap} from 'rxjs/operators';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthenService {

  constructor(
    public afAuth: AngularFireAuth,
    private router: Router
  ) { }


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(authState => {
        if (!!authState) {
          return !!authState;
        } else {
          this.router.navigate(['']);
          return false;
        }
      }));

    /* firebase.auth().onAuthStateChanged( user => {
      if (user) {
        return true;
      } else {
        return false;
      }
    }); */
  }

  /* isActivate( ): Observable<boolean> {
    return this.afAuth.authState.pipe(
      take(1),
      map(authState => !!authState),
      tap(authenticated => {
        if (authenticated) {
          return of(true);
        } else {
          this.router.navigate(['']);
          return of(false);
        }
      })
    );
  } */
}
