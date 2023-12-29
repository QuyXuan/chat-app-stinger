import { Timestamp } from '@angular/fire/firestore';

export interface Doc {
  id: string;
  userIds: string[];
  content: string;
  docName: string;
  lastChange: Date & Timestamp;
  changeBy: string;
}
