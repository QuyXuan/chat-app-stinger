import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { Subject } from 'rxjs';
import { constants } from 'src/app/constants';
import * as jwt from 'jsonwebtoken';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState: any;
  public isNotLoggedInSubject = new Subject<boolean>();

  constructor(
    private fireAuth: AngularFireAuth,
    private router: Router,
    private fireStore: AngularFirestore,
    private toastService: NgToastService
  ) {
    this.fireAuth.authState.subscribe((authState) => {
      this.authState = authState;
    });
  }

  get currentUserId(): string {
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
        this.saveToken(this.createToken(this.authState));
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
  }

  signInWithEmailAndPassword(email: string, password: string) {
    this.fireAuth
      .signInWithEmailAndPassword(email, password)
      .then((res) => {
        this.authState = res.user;
        this.saveToken(this.createToken(this.authState));
        this.setUserStatus(constants.STATUS_ONLINE);
        this.router.navigate(['dashboard']);
      })
      .catch((err) => {
        if (
          err.code === 'auth/invalid-login-credentials' ||
          err.code === 'auth/wrong-password'
        ) {
          this.toastService.error({
            detail: 'ERROR',
            summary: 'Wrong email or password!',
            duration: 5000,
          });
        }
      });
  }

  setUserStatus(status: string) {
    const statusDoc = this.fireStore.doc(`status/${this.currentUserId}`);
    statusDoc.update({ status: status }).catch((err) => {
      console.log(err);
    });
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

  createToken(data: any): string {
    const secretKey: string = constants.SECRET_KEY;
    const payLoad = {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName
    };
    const options: jwt.SignOptions = {
      expiresIn: '24h', // Thời gian hết hạn của token
    };
    const accessToken: string = jwt.sign(payLoad, secretKey, options);
    return JSON.stringify(payLoad);
  }

  saveToken(accessToken: string) {
    // Mã hoá access token dưới dạng Base64 trước khi lưu vào cookie
    this.setCookie('access-token', btoa(accessToken));
  }

  clearToken(): void {
    this.deleteCookie('access-token');
  }

  setCookie(key: string, value: string, hours: number = 24): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
    document.cookie = `${key} = ${value};expires=${expires.toUTCString()}`;
  }

  getCookie(keyCookie: string): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.trim().split('=');
      if (cookieKey === keyCookie) {
        return cookieValue;
      }
    }
    return null;
  }

  /**
   * Author: TaiPV - create 2023/11/04  
   * Delete the cookie by its name by setting the expiration time at a time in the past
   */
  deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  isLoggedIn(): boolean {
    return !!this.getCookie('access-token');
  }

  logout() {
    this.fireAuth.signOut();
    this.clearToken();
    this.router.navigate(['login']);
  }
}
