import { Timestamp } from '@angular/fire/firestore';

export interface Doc {
  userIds: string[];
  content: string;
  lastChange: Date & Timestamp;
  docName: string;
}
