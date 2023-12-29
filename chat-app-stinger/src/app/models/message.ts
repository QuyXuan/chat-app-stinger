import { Timestamp } from '@angular/fire/firestore';

export interface Message {
  text?: string;
  senderId: string;
  sentDate: Timestamp;
  avatar: string;
  displayName: string;
  type: string;
  dataFiles?: any[];
}
