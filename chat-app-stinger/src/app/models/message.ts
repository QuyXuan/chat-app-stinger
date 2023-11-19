import { Timestamp } from '@angular/fire/firestore';

export interface Message {
  text?: string;
  senderId: string;
  sentDate: Date & Timestamp;
  avatar: string;
  displayName: string;
  type: string;
  images?: any[];
}
