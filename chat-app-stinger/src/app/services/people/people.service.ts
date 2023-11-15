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
  catchError,
  forkJoin,
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

  sendFriendRequest(receiver: string): Observable<boolean> {
    return this.userService.currentUserProfile.pipe(
      switchMap((currentUser) => {
        if (currentUser) {
          const request = {
            sender: currentUser.email,
            receiver: receiver,
          };
          return from(
            addDoc(collection(this.firestore, 'requests'), request)
          ).pipe(switchMap(() => of(true)));
        } else {
          return of(false);
        }
      })
    );
  }

  acceptRequest(friendEmail: string): Observable<boolean> {
    return this.userService.currentUserProfile.pipe(
      mergeMap((user) => {
        const queryFriendsOfCurrentUser = query(
          collection(this.firestore, 'friends'),
          where('email', '==', user?.email)
        );
        const queryFriendsOfFriend = query(
          collection(this.firestore, 'friends'),
          where('email', '==', friendEmail)
        );

        return forkJoin({
          friendSnapshotCurrentUser: getDocs(queryFriendsOfCurrentUser),
          friendSnapshotFriend: getDocs(queryFriendsOfFriend),
        }).pipe(
          mergeMap(({ friendSnapshotCurrentUser, friendSnapshotFriend }) => {
            const addFriendObservables: Observable<any>[] = [];

            if (friendSnapshotCurrentUser.empty) {
              const currentUserFriendRef$ = from(
                addDoc(collection(this.firestore, 'friends'), {
                  email: user?.email,
                })
              ).pipe(
                switchMap((currentUserDoc) => {
                  return from(
                    addDoc(
                      collection(
                        this.firestore,
                        'friends',
                        currentUserDoc.id,
                        'myFriends'
                      ),
                      {
                        email: friendEmail,
                      }
                    )
                  );
                })
              );
              addFriendObservables.push(currentUserFriendRef$);
            } else {
              friendSnapshotCurrentUser.forEach((doc) => {
                const currentUserFriendRef$ = from(
                  addDoc(
                    collection(this.firestore, 'friends', doc.id, 'myFriends'),
                    {
                      email: friendEmail,
                    }
                  )
                );
                addFriendObservables.push(currentUserFriendRef$);
              });
            }

            if (friendSnapshotFriend.empty) {
              const friendFriendRef$ = from(
                addDoc(collection(this.firestore, 'friends'), {
                  email: friendEmail,
                })
              ).pipe(
                switchMap((friendUserDoc) => {
                  return from(
                    addDoc(
                      collection(
                        this.firestore,
                        'friends',
                        friendUserDoc.id,
                        'myFriends'
                      ),
                      {
                        email: user?.email,
                      }
                    )
                  );
                })
              );
              addFriendObservables.push(friendFriendRef$);
            } else {
              friendSnapshotFriend.forEach((doc) => {
                const friendFriendRef$ = from(
                  addDoc(
                    collection(this.firestore, 'friends', doc.id, 'myFriends'),
                    {
                      email: user?.email,
                    }
                  )
                );
                addFriendObservables.push(friendFriendRef$);
              });
            }

            return forkJoin(addFriendObservables).pipe(
              mergeMap(() => {
                return this.deleteRequest(friendEmail);
              }),
              map(() => true)
            );
          })
        );
      })
    );
  }

  deleteRequest(sender: string): Observable<boolean> {
    const queryRequest = query(
      collection(this.firestore, 'requests'),
      where('sender', '==', sender)
    );
    return from(getDocs(queryRequest)).pipe(
      mergeMap((snapshot) => {
        if (snapshot.empty) {
          return of(false);
        }
        return from(snapshot.docs).pipe(
          mergeMap((doc) => from(deleteDoc(doc.ref))),
          map(() => true)
        );
      }),
      catchError(() => of(false))
    );
  }
}
