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
  faPlus,
  faImage,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons';
import { Observable, combineLatest, map, of, startWith } from 'rxjs';
import { Chat } from 'src/app/models/chat';
import { Message } from 'src/app/models/message';
import { ProfileUser } from 'src/app/models/profile-user';
import { ChatService } from 'src/app/services/chat/chat.service';
import { DataTransferService } from 'src/app/services/data-transfer/data.service';
import { SelectedItem } from 'src/app/services/data-transfer/selected-item';
import { SocketService } from 'src/app/services/socket-service/socket.service';
import { UserService } from 'src/app/services/user/user.service';
import { DataImage } from './data-image';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
})
export class ChatPageComponent implements OnInit {
  isShowChatSidebar: boolean = true;

  // Kiểm tra xem có đang bấm vào nút để upload
  isShowUploadDialog: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Ô input nhập message
  currentRows: number = 1;
  textareaContent: string = '';
  @ViewChild('inputContent') inputContent!: ElementRef;

  // Các images đang chờ được gửi
  images: DataImage[] = [];

  userIdsInChat!: string[];

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
    faPlus: faPlus,
    faImage: faImage,
    faRecord: faMicrophone,
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
    private router: Router,
    private dataService: DataTransferService,
    private socketService: SocketService
  ) {
    const currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation?.extras?.state) {
      const chatId = currentNavigation.extras.state['chatId'];
      this.myChats.subscribe((chats) => {
        const chat = chats.find((chat) => chat.id === chatId);
        this.selectChat(chat);
      });
      this.dataService.updateSelectedNavLinkId(new SelectedItem(1, 'Chats'));
    }
  }

  ngOnInit(): void {
    this.dataService.selectedNavLink.subscribe(
      (selectedNavLink: SelectedItem) => {
        if (selectedNavLink.name != '' && selectedNavLink.name != 'Chats') {
          this.isShowChatSidebar = false;
        } else {
          this.isShowChatSidebar = true;
        }
      }
    );
  }

  createChat(friend: ProfileUser) {
    this.chatService.createChat(friend).subscribe();
  }

  selectChat(chat: any) {
    this.selectedChat = of(chat);
    this.chatService.getChatMessages(chat.id).subscribe((messages) => {
      this.messages = of(messages);
      this.selectedChatId = chat.id;
      this.getUsersInChat(this.selectedChatId);
      this.scrollToBottom();
    });
  }

  sendMessage() {
    // this.selectedChat?.subscribe((chat) => {
    //   const message = this.messageControl.value;
    //   const selectedChatId = chat.id;
    //   this.messageControl.setValue('');
    //   if (message && selectedChatId) {
    //     this.chatService
    //       .addChatMessage(selectedChatId, message)
    //       .subscribe(() => {
    //         this.scrollToBottom();
    //       });
    //   }
    // });
    this.socketService.sendImages(
      this.userIdsInChat,
      this.selectedChatId,
      this.images
    );
    this.images = [];
    this.messageControl.setValue('');
  }

  getUsersInChat(chatId: string) {
    this.chatService
      .getUserIdsInChat(chatId)
      .then((userIds) => {
        this.userIdsInChat = userIds;
      })
      .catch((error) => {
        console.log('getUsersInChat: ', error);
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

  /**
   * Check phím người dùng bấm để xem liệu có nên cho nhập kí tự, xuống hàng hay gửi message
   */
  onKeyDown(event: KeyboardEvent) {
    const lines = this.textareaContent.split('\n');
    if (event.key === 'Backspace' || event.key === 'Delete') {
      const lastLine = lines[lines.length - 1];
      // Nếu hàng cuối cùng trống, giảm số hàng
      if (lines.length == 1 || lastLine.trim() === '') {
        this.currentRows = this.textareaContent.split('\n').length;
        this.currentRows = Math.min(Math.max(this.currentRows - 1, 1), 10);
      }
    } else if (event.shiftKey && event.key === 'Enter') {
      this.currentRows++;
      this.currentRows = Math.min(this.currentRows, 10);
    } else if (event.key === 'Enter') {
      // Nếu là Enter thì không cho nhảy xuống hàng mà gửi luôn
      event.preventDefault();
    }
  }

  uploadImages() {
    // Lọc chỉ chấp nhận các loại file hình ảnh
    this.fileInput.nativeElement.accept = 'image/*';
    this.fileInput.nativeElement.click();
  }

  /**
   * Xử lí sự kiện upload file
   * @param event
   */
  onFileSelected(event: any) {
    this.isShowUploadDialog = !this.isShowUploadDialog;
    const files = event.target.files;
    if (files) {
      for (const file of files) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e: any) => {
          const dataImage: DataImage = {
            fileName: file.name,
            base64: e.target.result,
          };
          this.images.push(dataImage);
        };
      }
    }
  }

  /**
   * Xử lí sự kiện xoá 1 image khi người dùng click vào dấu X trên từng hình
   * @param index
   */
  removeImage(index: number) {
    this.images = this.images.filter(
      (image, currentIndex) => currentIndex != index
    );
  }
}
