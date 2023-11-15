import { Injectable } from '@angular/core';
import {
  Firestore,
  Timestamp,
  addDoc,
  arrayUnion,
  collection,
  collectionData,
  doc,
  getDoc,
  docData,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Observable, concatMap, from, map, of, switchMap, take } from 'rxjs';
import { UserService } from '../user/user.service';
import { Chat } from 'src/app/models/chat';
import { ProfileUser } from 'src/app/models/profile-user';
import { Message } from 'src/app/models/message';
import { constants } from 'src/app/constants';
import { TypeMessage } from 'src/app/models/type-message';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private firestore: Firestore, private userService: UserService) {}

  get myChats(): Observable<Chat[]> {
    return this.userService.currentUserProfile.pipe(
      concatMap((currentUser) => {
        const queryChat = query(
          collection(this.firestore, 'chats'),
          where('userIds', 'array-contains', currentUser?.uid)
          // orderBy('lastMessageDate', 'desc')
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
      const { groupChatName } = chat;
      if (groupChatName !== null && groupChatName !== undefined) {
        chat.groupChatName = groupChatName;
        chat.chatAvatar = constants.DEFAULT_GROUP_AVATAR_URL;
      } else {
        const otherUserIndex =
          chat.userIds.indexOf(currentUserId ?? '') === 0 ? 1 : 0;
        const { displayName, photoURL } = chat.users[otherUserIndex];
        chat.chatName = displayName;
        chat.chatAvatar = photoURL;
      }
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
                lastMessage: '',
                lastMessageDate: Timestamp.fromDate(new Date()),
              });
              return from(newChatRef).pipe(map((docRef) => docRef.id));
            }
          })
        );
      })
    );
  }

  createChatGroup(nameOfNewChatGroup: string): Observable<string> {
    const chatRef = collection(this.firestore, 'chats');
    return this.userService.currentUserProfile.pipe(
      take(1),
      concatMap((currentUser) => {
        const newChatRef = addDoc(chatRef, {
          userIds: [currentUser?.uid],
          users: [
            {
              displayName: currentUser?.displayName,
              photoURL: currentUser?.photoURL,
            },
          ],
          lastMessage: '',
          lastMessageDate: Timestamp.fromDate(new Date()),
          groupChatName: nameOfNewChatGroup,
        });
        return from(newChatRef).pipe(map((docRef) => docRef.id));
      })
    );
  }

  addChatMessage(
    chatId: string,
    message: string,
    type: TypeMessage
  ): Observable<any> {
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
          avatar: currentUser?.photoURL,
          displayName: currentUser?.displayName,
          type: type,
        })
      ),
      concatMap(() =>
        updateDoc(chatRef, {
          lastMessage: type === TypeMessage.Text ? message : 'file.xyz',
          lastMessageDate: today,
        })
      )
    );
  }

  getChatMessages(chatId: string, take: number): Observable<Message[]> {
    const msgRef = collection(this.firestore, 'chats', chatId, 'messages');
    const queryAllMsg = query(msgRef, orderBy('sentDate', 'desc'), limit(take));
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

  getMembersOfGroupChat(chatId: string): Observable<ProfileUser[]> {
    const chatRef = doc(this.firestore, 'chats', chatId);
    return docData(chatRef).pipe(
      switchMap((chat: any) => {
        return this.userService.getUsersById(chat.userIds);
      })
    );
  }

  addMemberToGroupChat(
    newMembers: ProfileUser[],
    chatId: string
  ): Observable<any> {
    const chatRef = doc(this.firestore, 'chats', chatId);
    const memberIds = newMembers.map((member) => member.uid);
    const memberNameAndAvatar = newMembers.map((member) => ({
      displayName: member.displayName,
      photoURL: member.photoURL,
    }));
    return from(
      updateDoc(chatRef, {
        userIds: arrayUnion(...memberIds),
        users: arrayUnion(...memberNameAndAvatar),
      })
    );
  }

  addImageToStorage(file: any) {
    return new Observable<string>((observer) => {
      const filePath = `images/${Date.now()}_${file.name}`;
      const fileRef = ref(getStorage(), filePath);
      uploadBytes(fileRef, file)
        .then((snapshot) => getDownloadURL(snapshot.ref))
        .then((downloadURL) => {
          observer.next(downloadURL);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
