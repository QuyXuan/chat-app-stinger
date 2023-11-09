import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  Firestore,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import {
  from,
  Observable,
  switchMap,
  of,
  map,
  mergeMap,
  combineLatest,
} from 'rxjs';
import { UserService } from '../user/user.service';
import { ProfileUser } from 'src/app/models/profile-user';

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  constructor(private firestore: Firestore, private userService: UserService) {}

  get allUsersExceptMe(): Observable<ProfileUser[]> {
    return this.userService.currentUserProfile.pipe(
      switchMap((currentUser) => {
        if (currentUser) {
          const userRef = collection(this.firestore, 'users');
          const queryAll = query(
            userRef,
            where('email', '!=', currentUser.email)
          );
          return collectionData(queryAll) as Observable<ProfileUser[]>;
        } else {
          return of([]);
        }
      })
    );
  }

  get friendsOfUser(): Observable<ProfileUser[]> {
    return this.userService.currentUserProfile.pipe(
      switchMap((currentUser) => {
        if (!currentUser) {
          return of([]);
        }
        const friendRef = collection(this.firestore, 'friends');
        const queryFriends = query(
          friendRef,
          where('email', '==', currentUser.email)
        );
        return from(getDocs(queryFriends)).pipe(
          switchMap((querySnapshot) => {
            if (!querySnapshot.empty) {
              let friendsId = '';
              querySnapshot.forEach((doc) => {
                friendsId = doc.id;
              });
              const myFriendsRef = collection(
                this.firestore,
                'friends',
                friendsId,
                'myFriends'
              );
              return from(getDocs(myFriendsRef)).pipe(
                map((myFriendsEmailQuerySnapshot) => {
                  const myFriendsEmail: string[] = [];
                  if (!myFriendsEmailQuerySnapshot.empty) {
                    myFriendsEmailQuerySnapshot.forEach((myFriend) => {
                      myFriendsEmail.push(myFriend.data()['email']);
                    });
                  }
                  return this.userService.getUsersByEmail(myFriendsEmail);
                })
              );
            } else {
              return of([]);
            }
          })
        );
      }),
      switchMap((observableArray) => observableArray)
    );
  }

  get pendingFriendsOfUser(): Observable<ProfileUser[]> {
    return this.userService.currentUserProfile.pipe(
      switchMap((currentUser) => {
        if (!currentUser) {
          return of([] as ProfileUser[]);
        }
        const pendingRef = collection(this.firestore, 'requests');
        const queryPending = query(
          pendingRef,
          where('receiver', '==', currentUser.email)
        );
        return from(getDocs(queryPending)).pipe(
          mergeMap((pendingSnapshot) => {
            const pendingRequests: string[] = [];
            pendingSnapshot.forEach((pending) => {
              pendingRequests.push(pending.data()['sender']);
            });
            return this.userService.getUsersByEmail(pendingRequests);
          })
        );
      })
    );
  }

  get newFriendsOfUser(): Observable<ProfileUser[]> {
    return combineLatest([
      this.userService.currentUserProfile.pipe(
        switchMap((currentUser) => {
          if (currentUser) {
            const userRef = collection(this.firestore, 'users');
            const queryAll = query(
              userRef,
              where('email', '!=', currentUser.email)
            );
            return collectionData(queryAll);
          } else {
            return of([]);
          }
        }),
        map((data) => {
          return data.map((user) => user['email']);
        })
      ),
      this.userService.currentUserProfile.pipe(
        switchMap((currentUser) => {
          if (currentUser) {
            const pendingRef = collection(this.firestore, 'requests');
            const queryPending = query(
              pendingRef,
              where('receiver', '==', currentUser.email)
            );
            return collectionData(queryPending);
          } else {
            return of([]);
          }
        }),
        map((data) => {
          return data.map((user) => user['sender']);
        })
      ),
      this.userService.currentUserProfile.pipe(
        switchMap((currentUser) => {
          if (!currentUser) {
            return of([]);
          }
          const friendRef = collection(this.firestore, 'friends');
          const queryFriends = query(
            friendRef,
            where('email', '==', currentUser.email)
          );
          return from(getDocs(queryFriends)).pipe(
            switchMap((querySnapshot) => {
              if (!querySnapshot.empty) {
                let friendsId = '';
                querySnapshot.forEach((doc) => {
                  friendsId = doc.id;
                });
                const myFriendsRef = collection(
                  this.firestore,
                  'friends',
                  friendsId,
                  'myFriends'
                );
                return from(getDocs(myFriendsRef)).pipe(
                  map((myFriendsEmailQuerySnapshot) => {
                    const emailList: string[] = [];
                    if (!myFriendsEmailQuerySnapshot.empty) {
                      myFriendsEmailQuerySnapshot.forEach((myFriend) => {
                        emailList.push(myFriend.data()['email']);
                      });
                    }
                    return emailList;
                  })
                );
              } else {
                return of([]);
              }
            })
          );
        })
      ),
    ]).pipe(
      switchMap(([allUsersEmails, pendingFriendsEmails, myFriendsEmails]) => {
        const newFriendsEmail = allUsersEmails.filter((email) => {
          return (
            !pendingFriendsEmails.includes(email) &&
            !myFriendsEmails.includes(email)
          );
        });
        return this.userService.getUsersByEmail(newFriendsEmail);
      })
    );
  }

  sendFriendRequest(receiver: string) {
    return new Promise((resolve) => {
      this.userService.currentUserProfile.subscribe((user) => {
        if (user) {
          const request = {
            sender: user.email,
            receiver: receiver,
          };
          addDoc(collection(this.firestore, 'requests'), request)
            .then(() => {
              resolve(true);
            })
            .catch((error) => {
              resolve(false);
            });
        }
      });
    });
  }

  acceptRequest(friendEmail: string) {
    this.userService.currentUserProfile.subscribe((user) => {
      const queryFriendsOfCurrentUser = query(
        collection(this.firestore, 'friends'),
        where('email', '==', user?.email)
      );
      const queryFriendsOfFriend = query(
        collection(this.firestore, 'friends'),
        where('email', '==', friendEmail)
      );

      Promise.all([
        getDocs(queryFriendsOfCurrentUser),
        getDocs(queryFriendsOfFriend),
      ]).then(([friendSnapshotCurrentUser, friendSnapshotFriend]) => {
        const addFriendPromises: Promise<any>[] = [];

        if (friendSnapshotCurrentUser.empty) {
          const currentUserFriendRef = addDoc(
            collection(this.firestore, 'friends'),
            {
              email: user?.email,
            }
          ).then((currentUserDoc) => {
            return addDoc(
              collection(
                this.firestore,
                'friends',
                currentUserDoc.id,
                'myFriends'
              ),
              {
                email: friendEmail,
              }
            );
          });
          addFriendPromises.push(currentUserFriendRef);
        } else {
          friendSnapshotCurrentUser.forEach((doc) => {
            const currentUserFriendRef = addDoc(
              collection(this.firestore, 'friends', doc.id, 'myFriends'),
              {
                email: friendEmail,
              }
            );
            addFriendPromises.push(currentUserFriendRef);
          });
        }

        if (friendSnapshotFriend.empty) {
          const friendFriendRef = addDoc(
            collection(this.firestore, 'friends'),
            {
              email: friendEmail,
            }
          ).then((friendUserDoc) => {
            return addDoc(
              collection(
                this.firestore,
                'friends',
                friendUserDoc.id,
                'myFriends'
              ),
              {
                email: user?.email,
              }
            );
          });
          addFriendPromises.push(friendFriendRef);
        } else {
          friendSnapshotFriend.forEach((doc) => {
            const friendFriendRef = addDoc(
              collection(this.firestore, 'friends', doc.id, 'myFriends'),
              {
                email: user?.email,
              }
            );
            addFriendPromises.push(friendFriendRef);
          });
        }

        Promise.all(addFriendPromises)
          .then(() => {
            this.deleteRequest(friendEmail)
              .then(() => {
                return true;
              })
              .catch((error) => {
                return false;
              });
          })
          .catch((error) => {
            return false;
          });
      });
    });
  }

  deleteRequest(sender: string) {
    return new Promise((resolve) => {
      const queryRequest = query(
        collection(this.firestore, 'requests'),
        where('sender', '==', sender)
      );
      getDocs(queryRequest)
        .then((snapshot) => {
          if (!snapshot.empty) {
            const deletePromises = snapshot.docs.map((doc) =>
              deleteDoc(doc.ref)
            );

            Promise.all(deletePromises)
              .then(() => {
                resolve(true);
              })
              .catch((error) => {
                resolve(false);
              });
          } else {
            resolve(false);
          }
        })
        .catch((error) => {
          resolve(false);
        });
    });
  }
}
