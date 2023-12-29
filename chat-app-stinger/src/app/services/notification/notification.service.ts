import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, getDocs, orderBy, query, updateDoc, where } from '@angular/fire/firestore';
import { NotificationData } from './notification-data';
import { Utils } from 'src/app/helpers/utils';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private firestore: Firestore) { }

  getNotifications(): Observable<NotificationData[]> {
    const userId = Utils.getUserId();
    const notificationQuery = query(
      collection(this.firestore, 'notifications'),
      where('receiverId', '==', userId),
      orderBy('sendAt', 'desc')
    );

    return collectionData(notificationQuery).pipe(
      map((notifications) => {
        const result: NotificationData[] = [];
        notifications.forEach((notification) => {
          const data = notification;
          const notificationData: NotificationData = {
            senderName: data['senderName'],
            senderAvatar: data['senderAvatar'],
            groupChatName: data['groupChatName'],
            content: data['content'],
            type: data['type'],
            isSeen: data['isSeen'],
            receiveAtSaveInDB: data['sendAt'],
            receiveAt: Utils.calculateBetweenTwoTime(data['sendAt'])
          };
          result.push(notificationData);
        });
        return result;
      })
    );
  }

  seenNewNotifications() {
    const userId = Utils.getUserId();
    const notificationQuery = query(
      collection(this.firestore, 'notifications'),
      where('receiverId', '==', userId),
      where('isSeen', '==', false)
    )

    getDocs(notificationQuery).then((notifications) => {
      notifications.docs.map(doc => doc.ref).forEach((notification) => {
        updateDoc(notification, {
          isSeen: true
        });
      })
    });
  }
}