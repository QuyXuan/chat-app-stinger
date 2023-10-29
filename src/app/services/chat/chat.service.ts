import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public openChatPage = new Subject<boolean>();
  constructor() {}
}
