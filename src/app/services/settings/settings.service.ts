import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, switchMap } from 'rxjs';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  currentUser = new BehaviorSubject<firebase.User | null>(null);

  constructor(
    private fireAuth: AngularFireAuth,
    private fireStore: AngularFirestore,
    private fireStorage: AngularFireStorage
  ) {
    this.fireAuth.authState.subscribe((user) => {
      if (user) {
        this.currentUser.next(user);
      }
    });
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser.pipe(
      switchMap((user) => {
        if (user?.email) {
          return this.fireStore.collection('users', (ref) =>
            ref.where('email', '==', user.email)
          ).valueChanges();
        } else {
          return from([]);
        }
      })
    );
  }

  updateUserInfo(data: any) {
    const user = this.currentUser.value;
    if (user) {
      const userRef = this.fireStore.collection('users').doc(user.uid);
      return userRef.update(data);
    }
    return Promise.reject('User not authenticated');
  }
}
