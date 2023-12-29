import { Injectable } from '@angular/core';
import {
  DocumentData,
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, Observer, from, map } from 'rxjs';
import { Doc } from 'src/app/models/doc';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class DocService {
  currentUserName: string = '';

  constructor(private firestore: Firestore, private userService: UserService) {
    this.userService.currentUserProfile.subscribe((currentUser) => {
      this.currentUserName = currentUser!.displayName ?? '';
    });
  }

  createDoc(
    userIds: string[],
    chatId: string,
    docName: string
  ): Observable<string> {
    const docsRef = collection(this.firestore, 'docs');
    const newDocRef = addDoc(docsRef, {
      chatId: chatId,
      userIds: userIds,
      userIdsConverted: this.convertUserIds(userIds),
      docName: docName,
      content: '',
      changeBy: this.currentUserName,
      lastChange: Timestamp.fromDate(new Date()),
    });
    return from(newDocRef).pipe(map((docRef) => docRef.id));
  }

  updateDoc(docId: string, content: string): Observable<void> {
    const docRef = doc(this.firestore, 'docs', docId);
    const updatePayload = {
      content: content,
      lastChange: Timestamp.fromDate(new Date()),
      changeBy: this.currentUserName,
    };
    return from(updateDoc(docRef, updatePayload));
  }

  getDocData(docId: string): Observable<Doc> {
    const docRef = doc(this.firestore, 'docs', docId);
    return new Observable((observer: Observer<Doc>) => {
      const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as DocumentData;
          observer.next({ ...data, id: docSnapshot.id } as Doc);
        } else {
          observer.error(new Error('Document not found!'));
        }
      });
      return { unsubscribe };
    });
  }

  getDocs(userIds: string[], chatId: string): Observable<Doc[]> {
    const queryDoc = query(
      collection(this.firestore, 'docs'),
      where('userIdsConverted', '==', this.convertUserIds(userIds)),
      where('chatId', '==', chatId)
    );
    return collectionData(queryDoc, { idField: 'id' }) as Observable<Doc[]>;
  }

  private convertUserIds(userIds: string[]) {
    return userIds.join('').split('').sort().join('');
  }
}
