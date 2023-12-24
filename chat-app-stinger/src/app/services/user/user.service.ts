import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { from, Observable, of, switchMap } from 'rxjs';
import { ProfileUser } from 'src/app/models/profile-user';
import { AuthService } from '../auth/auth.service';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  get currentUserProfile(): Observable<ProfileUser | null> {
    return this.authService.currentUser.pipe(
      switchMap((user) => {
        if (!user?.uid) {
          return of(null);
        }
        const ref = doc(this.firestore, 'users', user?.uid);
        return docData(ref) as Observable<ProfileUser>;
      })
    );
  }

  get allUser(): Observable<ProfileUser[]> {
    const ref = collection(this.firestore, 'users');
    const queryAll = query(ref);
    return collectionData(queryAll) as Observable<ProfileUser[]>;
  }

  constructor(private firestore: Firestore, private authService: AuthService) { }

  addUser(user: ProfileUser): Observable<any> {
    const ref = doc(this.firestore, 'users', user?.uid);
    return from(setDoc(ref, user));
  }

  updateUser(user: ProfileUser): Observable<any> {
    const ref = doc(this.firestore, 'users', user?.uid);
    return from(updateDoc(ref, { ...user }));
  }

  getUsersByEmail(emails: (string | undefined)[]): Observable<ProfileUser[]> {
    const usersRef = collection(this.firestore, 'users');
    const queryUser = query(usersRef, where('email', 'in', emails));
    return collectionData(queryUser, { idField: 'uid' }) as Observable<
      ProfileUser[]
    >;
  }

  getUsersById(ids: (string | undefined)[]): Observable<ProfileUser[]> {
    const usersRef = collection(this.firestore, 'users');
    const queryUser = query(usersRef, where('uid', 'in', ids));
    return collectionData(queryUser, { idField: 'uid' }) as Observable<
      ProfileUser[]
    >;
  }

  async getUserIdByEmail(email: string): Promise<string | undefined> {
    const usersRef = collection(this.firestore, 'users');
    const queryUser = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(queryUser);
    if (querySnapshot.size == 1) {
      return querySnapshot.docs[0].data()['uid'];
    }
    return undefined;
  }
}
