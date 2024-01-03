import { Timestamp } from '@angular/fire/firestore';

export interface Message {
  id?: string;
  text?: string;
  isEdited?: string;
  isDeleted?: string;
  senderId: string;
  sentDate: Timestamp;
  avatar: string;
  displayName: string;
  type: string;
  dataFiles?: any[];
}
