import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, orderBy, query, updateDoc, where } from '@angular/fire/firestore';
import { Utils } from 'src/app/helpers/utils';
import { NotificationData } from './notification-data';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private firestore: Firestore) { }

  getNotifications() {
    const userId = Utils.getUserId();
    const notificationQuery = query(
      collection(this.firestore, 'notifications'),
      where('receiverId', '==', userId),
      orderBy('receiveAt', 'desc')
    )

    const result: NotificationData[] = [];
    return getDocs(notificationQuery).then((notifications) => {
      notifications.forEach((notification) => {
        const data = notification.data();
        const notificationData: NotificationData = {
          senderName: data['senderName'],
          senderAvatar: data['senderAvatar'],
          groupChatName: data['groupChatName'],
          content: data['content'],
          isSeen: data['isSeen'],
          receiveAtSaveInDB: data['receiveAt'],
          receiveAt: Utils.calculateBetweenTwoTime(data['receiveAt'])
        };
        result.push(notificationData);
      });
      return result;
    });
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
