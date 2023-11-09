import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  faMagnifyingGlass,
  faCircle,
  faPhone,
  faVideo,
  faEllipsisVertical,
  faPaperclip,
  faIcons,
  faCamera,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';
import { Observable, combineLatest, map, of, startWith } from 'rxjs';
import { Chat } from 'src/app/models/chat';
import { Message } from 'src/app/models/message';
import { ProfileUser } from 'src/app/models/profile-user';
import { ChatService } from 'src/app/services/chat/chat.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
})
export class ChatPageComponent implements OnInit {
  @ViewChild('endOfChat')
  endOfChat: ElementRef | undefined;
  faIcon = {
    faMagnifyingGlass: faMagnifyingGlass,
    faCircle: faCircle,
    faPhone: faPhone,
    faVideo: faVideo,
    faEllipsisVertical: faEllipsisVertical,
    faPaperclip: faPaperclip,
    faIcons: faIcons,
    faCamera: faCamera,
    faPaperPlane: faPaperPlane,
  };
  searchControl = new FormControl('');
  messageControl = new FormControl('');
  currentUser = this.userService.currentUserProfile;
  selectedChatId = '';
  myChats = combineLatest([
    this.chatService.myChats,
    this.searchControl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([chats, searchString]) => {
      return chats.filter((chat) =>
        chat.chatName?.toLowerCase().includes(searchString!.toLowerCase())
      );
    })
  );
  selectedChat: Observable<Chat> | undefined;
  messages: Observable<Message[]> | undefined;

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private router: Router
  ) {
    const currentNavigation = this.router.getCurrentNavigation();
    if (
      currentNavigation &&
      currentNavigation.extras &&
      currentNavigation.extras.state
    ) {
      const chatId = currentNavigation.extras.state['chatId'];
      this.myChats.subscribe((chats) => {
        const chat = chats.find((chat) => chat.id === chatId);
        this.selectChat(chat);
      });
    }
  }

  ngOnInit(): void {}

  createChat(friend: ProfileUser) {
    this.chatService.createChat(friend).subscribe();
  }

  selectChat(chat: any) {
    this.selectedChat = of(chat);
    this.chatService.getChatMessages(chat.id).subscribe((messages) => {
      this.messages = of(messages);
      this.selectedChatId = chat.id;
      this.scrollToBottom();
    });
  }

  sendMessage() {
    this.selectedChat?.subscribe((chat) => {
      const message = this.messageControl.value;
      const selectedChatId = chat.id;
      this.messageControl.setValue('');
      if (message && selectedChatId) {
        this.chatService
          .addChatMessage(selectedChatId, message)
          .subscribe(() => {
            this.scrollToBottom();
          });
      }
    });
  }

  scrollToBottom() {
    if (this.endOfChat) {
      const endOfChatElement = this.endOfChat.nativeElement;
      if (endOfChatElement) {
        const scrollOptions = {
          behavior: 'smooth',
        };
        window.requestAnimationFrame(() => {
          endOfChatElement.scrollIntoView(scrollOptions);
        });
      }
    }
  }
}
