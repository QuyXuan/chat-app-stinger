import { Injectable } from '@angular/core';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, concatMap, from, map, of, switchMap, take } from 'rxjs';
import { UserService } from '../user/user.service';
import { Chat } from 'src/app/models/chat';
import { ProfileUser } from 'src/app/models/profile-user';
import { Message } from 'src/app/models/message';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private firestore: Firestore, private userService: UserService) { }

  get myChats(): Observable<Chat[]> {
    return this.userService.currentUserProfile.pipe(
      concatMap((currentUser) => {
        const queryChat = query(
          collection(this.firestore, 'chats'),
          where('userIds', 'array-contains', currentUser?.uid)
        );
        return collectionData(queryChat, { idField: 'id' }).pipe(
          map((chats: any) =>
            this.addChatNameAndAvatar(currentUser?.uid, chats)
          )
        ) as Observable<Chat[]>;
      })
    );
  }

  addChatNameAndAvatar(
    currentUserId: string | undefined,
    chats: Chat[]
  ): Chat[] {
    chats.forEach((chat) => {
      const otherUserIndex =
        chat.userIds.indexOf(currentUserId ?? '') === 0 ? 1 : 0;
      const { displayName, photoURL } = chat.users[otherUserIndex];
      chat.chatName = displayName;
      chat.chatAvatar = photoURL;
    });
    return chats;
  }

  createChat(otherUser: ProfileUser): Observable<string> {
    const chatRef = collection(this.firestore, 'chats');
    return this.userService.currentUserProfile.pipe(
      take(1),
      concatMap((currentUser) => {
        const currentUserID = currentUser?.uid;
        const otherUserID = otherUser?.uid;
        const queryFriend = query(
          chatRef,
          where('userIds', 'in', [
            [currentUserID, otherUserID],
            [otherUserID, currentUserID],
          ])
        );

        return from(getDocs(queryFriend)).pipe(
          switchMap((querySnapshot) => {
            if (!querySnapshot.empty) {
              return of(querySnapshot.docs[0].id);
            } else {
              const newChatRef = addDoc(chatRef, {
                userIds: [currentUserID, otherUserID],
                users: [
                  {
                    displayName: currentUser?.displayName,
                    photoURL: currentUser?.photoURL,
                  },
                  {
                    displayName: otherUser?.displayName,
                    photoURL: otherUser?.photoURL,
                  },
                ],
              });
              return from(newChatRef).pipe(map((docRef) => docRef.id));
            }
          })
        );
      })
    );
  }

  addChatMessage(chatId: string, message: string): Observable<any> {
    const msgRef = collection(this.firestore, 'chats', chatId, 'messages');
    const chatRef = doc(this.firestore, 'chats', chatId);
    const today = Timestamp.fromDate(new Date());
    return this.userService.currentUserProfile.pipe(
      take(1),
      concatMap((currentUser) =>
        addDoc(msgRef, {
          text: message,
          senderId: currentUser?.uid,
          sentDate: today,
        })
      ),
      concatMap(() =>
        updateDoc(chatRef, { lastMessage: message, lastMessageDate: today })
      )
    );
  }

  getChatMessages(chatId: string): Observable<Message[]> {
    const msgRef = collection(this.firestore, 'chats', chatId, 'messages');
    const queryAllMsg = query(msgRef, orderBy('sentDate', 'asc'));
    return collectionData(queryAllMsg) as Observable<Message[]>;
  }

  async getUserIdsInChat(chatId: string) {
    const chatRef = doc(this.firestore, 'chats', chatId);
    const chatDocSnapshot = await getDoc(chatRef);
    if (chatDocSnapshot.exists()) {
      return chatDocSnapshot.data()['userIds'];
    }
    return [];
  }
}
