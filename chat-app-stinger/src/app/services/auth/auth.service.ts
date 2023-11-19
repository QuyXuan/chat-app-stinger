import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  UserInfo,
} from '@angular/fire/auth';
import {
  catchError,
  concatMap,
  from,
  Observable,
  of,
  Subject,
  tap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = authState(this.auth);
  public isNotLoggedInSubject = new Subject<boolean>();

  constructor(private auth: Auth) {}

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap((userCredential) => {
        this.saveAccessToken(JSON.stringify(userCredential));
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  signUp(email: string, password: string) {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      tap((userCredential) => {
        this.saveAccessToken(JSON.stringify(userCredential));
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  updateProfileData(profileData: Partial<UserInfo>): Observable<any> {
    const user = this.auth.currentUser;
    return of(user).pipe(
      concatMap((user) => {
        if (!user) throw new Error('Not Authenticated');
        return updateProfile(user, profileData);
      })
    );
  }

  logout() {
    localStorage.clear();
    return from(this.auth.signOut());
  }

  saveAccessToken(accessToken: string) {
    localStorage.setItem('access_token', accessToken);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getCookie(keyCookie: string): string | undefined {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.trim().split('=');
      if (cookieKey === keyCookie) {
        return decodeURIComponent(cookieValue);
      }
    }
    return undefined;
  }

  setCookie(name: string, value: string, hours: number = 24): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
