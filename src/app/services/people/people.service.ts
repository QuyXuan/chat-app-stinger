import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { BehaviorSubject, map } from 'rxjs';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  currentUser = new BehaviorSubject<firebase.User | null>(null);
  requestRef = this.fireStore.collection('requests');
  friendRef = this.fireStore.collection('friends').ref;

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

  getAllUsers() {
    return this.fireStore
      .collection('users')
      .valueChanges()
      .pipe(
        map((users: any) => {
          users.forEach((user: any, i: number) => {
            if (user.email == this.currentUser.value?.email) {
              users.splice(i, 1);
            }
          });
          return users;
        })
      );
  }

  getFriendsOfUser() {
    return new Promise<any[]>((resolve, reject) => {
      let myFriendsEmail: any[] = [];
      const queryFriendsOfUser = this.friendRef.where(
        'email',
        '==',
        this.currentUser.value?.email
      );
      queryFriendsOfUser
        .get()
        .then((friendSnapshot) => {
          if (!friendSnapshot.empty) {
            this.fireStore
              .doc(`friends/${friendSnapshot.docs[0].id}`)
              .collection('myFriends')
              .valueChanges()
              .subscribe((myFriends) => {
                myFriendsEmail = myFriends.map((friend) => friend['email']);
                resolve(this.getUsers(myFriendsEmail));
              });
          } else {
            resolve(this.getUsers(myFriendsEmail));
          }
        })
        .catch((error) => reject(error));
    });
  }

  getNewFriendsOfUser() {
    return new Promise<any[]>((resolve, reject) => {
      let users: any[] = [];
      let myFriendsEmail: any[] = [];
      let requestEmails: any[] = [];
      const usersRef = this.fireStore.collection('users').ref;
      const queryFriendsOfUser = this.friendRef.where(
        'email',
        '==',
        this.currentUser.value?.email
      );
      queryFriendsOfUser
        .get()
        .then((friendSnapshot) => {
          if (!friendSnapshot.empty) {
            this.fireStore
              .doc(`friends/${friendSnapshot.docs[0].id}`)
              .collection('myFriends')
              .valueChanges()
              .subscribe((myFriends) => {
                myFriendsEmail = myFriends.map((friend) => friend['email']);
                const queryRequestsOfUser = this.requestRef.ref.where(
                  'sender',
                  '==',
                  this.currentUser.value?.email
                );
                queryRequestsOfUser
                  .get()
                  .then((requestSnapshot) => {
                    if (!requestSnapshot.empty) {
                      requestSnapshot.docs.forEach((doc) => {
                        const requestData = doc.data() as { receiver: string };
                        requestEmails.push(requestData.receiver);
                      });
                    }
                  })
                  .then(() => {
                    const queryNewFriends = usersRef.where('email', 'not-in', [
                      ...myFriendsEmail,
                      ...requestEmails,
                      this.currentUser.value?.email,
                    ]);
                    queryNewFriends.get().then((userSnapshot) => {
                      if (!userSnapshot.empty) {
                        userSnapshot.docs.forEach((doc) => {
                          const userData = doc.data() as { email: string };
                          if (userData.email !== this.currentUser.value?.email)
                            users.push(doc.data());
                        });
                      }
                    });
                    resolve(users);
                  });
              });
          } else {
            resolve(users);
          }
        })
        .catch((error) => reject(error));
    });
  }

  getUsers(emails: string[]) {
    const users: any[] = [];
    const usersRef = this.fireStore.collection('users').ref;
    const query = usersRef.where('email', 'in', emails);
    query.get().then((snapshot) => {
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc) => {
          users.push(doc.data());
        });
      }
    });
    return users;
  }

  sendFriendRequest(receiver: string) {
    const request = {
      sender: this.currentUser.value?.email,
      receiver: receiver,
    };
    return this.requestRef.add(request);
  }

  getMyRequests() {
    return this.fireStore
      .collection('requests', (ref) =>
        ref.where('sender', '==', this.currentUser.value?.email)
      )
      .valueChanges();
  }

  async acceptMyRequest(friendEmail: string) {
    try {
      const queryEmailOfCurrentUser = this.friendRef.where(
        'email',
        '==',
        this.currentUser.value?.email
      );
      const queryEmailOfFriend = this.friendRef.where(
        'email',
        '==',
        friendEmail
      );

      const [snapshotCurrentUser, snapshotFriend] = await Promise.all([
        queryEmailOfCurrentUser.get(),
        queryEmailOfFriend.get(),
      ]);

      if (snapshotCurrentUser.empty) {
        const currentUserDoc = await this.friendRef.add({
          email: this.currentUser.value?.email,
        });
        await currentUserDoc.collection('myFriends').add({
          email: friendEmail,
        });
      } else {
        const currentUserFriendDoc = this.fireStore.doc(
          `friends/${snapshotCurrentUser.docs[0].id}`
        );
        await currentUserFriendDoc
          .collection('myFriends')
          .add({ email: friendEmail });
      }

      if (snapshotFriend.empty) {
        const friendDoc = await this.friendRef.add({ email: friendEmail });
        await friendDoc.collection('myFriends').add({
          email: this.currentUser.value?.email,
        });
      } else {
        const friendUserDoc = this.fireStore.doc(
          `friends/${snapshotFriend.docs[0].id}`
        );
        await friendUserDoc.collection('myFriends').add({
          email: this.currentUser.value?.email,
        });
      }

      await this.deleteRequest(friendEmail);
      return true;
    } catch (error) {
      console.error('Error accepting request:', error);
      return false;
    }
  }

  deleteRequest(email: string) {
    return new Promise((resolve) => {
      const requestRef = this.requestRef.ref;
      const query = requestRef.where('receiver', '==', email);
      query.get().then((snapshot) => {
        if (!snapshot.empty) {
          const firstDoc = snapshot.docs[0];
          if (firstDoc) {
            firstDoc.ref.delete().then(() => {
              resolve(true);
            });
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  }
}
