import { Timestamp } from '@angular/fire/firestore';
import { ProfileUser } from './profile-user';

export interface Chat {
  id: string;
  fromUser?: any;
  lastMessage?: string;
  lastMessageDate?: Date & Timestamp;
  userIds: string[];
  users: ProfileUser[];
  chatAvatar?: string;
  chatName?: string;
  groupChatName?: string;
}
