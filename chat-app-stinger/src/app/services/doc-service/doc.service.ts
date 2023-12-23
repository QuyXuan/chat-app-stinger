import { Injectable } from '@angular/core';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  doc,
  getDoc,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Doc } from 'src/app/models/doc';

@Injectable({
  providedIn: 'root',
})
export class DocService {
  constructor(private firestore: Firestore) {}

  createDoc(userIds: string[], docName: string): Observable<string> {
    debugger;
    const docsRef = collection(this.firestore, 'docs');
    const newDocRef = addDoc(docsRef, {
      userIds: userIds,
      docName: docName,
      content: '',
      lastChange: Timestamp.fromDate(new Date()),
    });
    return from(newDocRef).pipe(map((docRef) => docRef.id));
  }

  updateDoc(docId: string, content: string): Observable<void> {
    const docRef = doc(this.firestore, 'documents', docId);
    const updatePayload = {
      content: content,
      lastChange: Timestamp.fromDate(new Date()),
    };
    return from(updateDoc(docRef, updatePayload));
  }

  getDocData(docId: string): Observable<Doc> {
    const docRef = doc(this.firestore, 'docs', docId);
    return from(getDoc(docRef)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return { ...data } as Doc;
        } else {
          throw new Error('Document not found!');
        }
      })
    );
  }

  getDocs(userIds: string[]): Observable<Doc[]> {
    const queryDoc = query(
      collection(this.firestore, 'docs'),
      where('userIds', 'in', this.getPermutations(userIds))
    );
    return collectionData(queryDoc, { idField: 'id' }) as Observable<Doc[]>;
  }

  private getPermutations(arr: any[]): any[] {
    const result: any[] = [];
    const generatePermutations = (
      permArr: any[],
      remainingItems: any[]
    ): void => {
      if (remainingItems.length === 0) {
        result.push(permArr.slice());
      } else {
        for (let i = 0; i < remainingItems.length; i++) {
          let newPermArr = permArr.concat(remainingItems[i]);
          let newRemainingItems = remainingItems
            .slice(0, i)
            .concat(remainingItems.slice(i + 1));
          generatePermutations(newPermArr, newRemainingItems);
        }
      }
    };
    generatePermutations([], arr);
    return result;
  }
}
