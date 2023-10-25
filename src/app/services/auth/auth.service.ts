import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { constants } from 'src/app/constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState: any;
  public isNotLoggedInSubject = new Subject<boolean>();

  constructor(
    private fireAuth: AngularFireAuth,
    private router: Router,
    private fireStore: AngularFirestore
  ) {
    this.fireAuth.authState.subscribe((authState) => {
      this.authState = authState;
    });
  }

  get currentUserId(): string {
    debugger;
    return this.authState ? this.authState.uid : '';
  }

  authUser(): boolean {
    return this.authState !== null && this.authState !== undefined;
  }

  registerWithEmailAndPassword(
    email: string,
    password: string,
    username: string
  ) {
    this.fireAuth
      .createUserWithEmailAndPassword(email, password)
      .then((res) => {
        this.authState = res;
        this.fireAuth.currentUser.then((user) => {
          user
            ?.updateProfile({
              displayName: username,
              photoURL: constants.DEFAULT_AVATAR_URL,
            })
            .then(() => {
              this.setUserData(email, username, user.photoURL!);
            })
            .catch((err) => {
              console.log(err);
            });
        });
      });
    this.saveAccessToken(JSON.stringify(this.authState));
  }

  signInWithEmailAndPassword(email: string, password: string) {
    this.fireAuth.signInWithEmailAndPassword(email, password).then((res) => {
      debugger;
      console.log(res);
      this.authState = res.user;
      this.setUserStatus(constants.STATUS_ONLINE);
    });
    this.saveAccessToken(JSON.stringify(this.authState));
  }

  setUserStatus(status: string) {
    const statusDoc = this.fireStore.doc(`status/${this.currentUserId}`);
    statusDoc.update({ status: status }).catch((err) => {
      console.log(err);
    });
    this.router.navigate(['dashboard']);
  }

  setUserData(email: string, displayName: string, photoURL: string) {
    const userPath = `users/${this.currentUserId}`;
    const statusPath = `status/${this.currentUserId}`;
    const userDoc = this.fireStore.doc(userPath);
    const statusDoc = this.fireStore.doc(statusPath);
    userDoc.set({
      email: email,
      displayName: displayName,
      photoURL: photoURL,
    });
    statusDoc.set({
      email: email,
      status: constants.STATUS_ONLINE,
    });
    this.router.navigate(['dashboard']);
  }

  saveAccessToken(accessToken: string) {
    localStorage.setItem('access_token', accessToken);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout() {
    this.fireAuth.signOut();
    localStorage.clear();
    this.router.navigate(['login']);
  }
}
