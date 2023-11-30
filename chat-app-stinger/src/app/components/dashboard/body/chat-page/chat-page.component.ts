import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
import { TypeMessage } from 'src/app/models/type-message';
import { ProfileUser } from 'src/app/models/profile-user';
import { ChatService } from 'src/app/services/chat/chat.service';
import { DataTransferService } from 'src/app/services/data-transfer/data.service';
import { SelectedItem } from 'src/app/services/data-transfer/selected-item';
import { SocketService } from 'src/app/services/socket-service/socket.service';
import { ModalService } from 'src/app/services/modal/modal.service';
import { UserService } from 'src/app/services/user/user.service';
import { DataFile } from './data-file';
import { constants } from 'src/app/constants';
import { AudioService } from 'src/app/services/audio/audio.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { VideoCallService } from 'src/app/services/video-call/video-call.service';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
})
export class ChatPageComponent implements OnInit {
  @ViewChild('inputContent') inputContent!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('endOfChat') endOfChat: ElementRef | undefined;
  @ViewChild('create_chat_group') createChatGroupModal: ElementRef | undefined;
  @ViewChild('add_member') addMemberModal: ElementRef | undefined;
  @ViewChild('audio_recorder') audioRecorderModal: ElementRef | undefined;
  @ViewChild('call_video') callVideoModal: ElementRef | undefined;
  @ViewChild('fileTransferInput')
  fileTransferInput!: ElementRef<HTMLInputElement>;

  isShowChatSidebar: boolean = true;
  isShowUploadDialog: boolean = false;
  currentRows: number = 1;
  textareaContent: string = '';
  isRecording = false;
  recordingTime = '00:00';
  recordingInterval: any;
  audioBlob: any;
  audioURL = '';

  // Các images đang chờ được gửi
  images: DataFile[] = [];
  files: DataFile[] = [];

  userIdsInChat!: string[];

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

  selectedForm: FormGroup = new FormGroup({});
  searchControl = new FormControl('');
  messageControl = new FormControl('');
  currentUser = this.userService.currentUserProfile;
  selectedChatId = '';
  nameOfNewChatGroup = '';
  isGroupChat = false;
  messageTake = constants.MESSAGE_TAKE;
  loadMessageFinished = true;

  myChats = combineLatest([
    this.chatService.myChats,
    this.searchControl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([chats, searchString]) => {
      return chats.filter((chat) => {
        if (chat.groupChatName !== undefined && chat.groupChatName !== null) {
          return chat.groupChatName
            ?.toLowerCase()
            .includes(searchString!.toLowerCase());
        }
        return chat.chatName
          ?.toLowerCase()
          .includes(searchString!.toLowerCase());
      });
    })
  );

  selectedChat: Observable<Chat> | undefined;
  messages: Observable<Message[]> | undefined;
  membersOfGroupChat: Observable<ProfileUser[]> | undefined;
  newMembersOfGroupChat: Observable<ProfileUser[]> | undefined;

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private router: Router,
    private dataService: DataTransferService,
    private socketService: SocketService,
    private modalService: ModalService,
    private formBuilder: FormBuilder,
    private audioService: AudioService,
    private toastService: ToastService,
    private videoCallService: VideoCallService
  ) {
    this.selectedForm = this.formBuilder.group({
      selectedMemberIds: [],
    });
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
    this.videoCallService.requestMediaDevices();
  }

  createChat(friend: ProfileUser) {
    this.chatService.createChat(friend).subscribe();
  }

  selectChat(chat: any) {
    this.isGroupChat = chat?.groupChatName !== undefined;
    this.messageTake = constants.MESSAGE_TAKE;
    if (this.isGroupChat) {
      this.chatService.getMembersOfGroupChat(chat.id).subscribe((users) => {
        this.membersOfGroupChat = of(users);
        this.getNewMembersOfGroupChat().subscribe((users) => {
          this.newMembersOfGroupChat = of(users);
        });
      });
    }
    this.selectedChat = of(chat);
    this.chatService
      .getChatMessages(chat.id, this.messageTake)
      .subscribe((messages) => {
        this.messages = of(messages.reverse());
        this.selectedChatId = chat.id;
        this.getUsersInChat(this.selectedChatId);
        this.scrollToBottom();
      });
  }

  sendMessage() {
    if (
      this.selectedChatId === '' ||
      (this.messageControl.value?.trim() === '' &&
        this.images.length === 0 &&
        this.files.length === 0)
    ) {
      return;
    }
    if (this.messageControl.value?.trim() !== '') {
      if (constants.URL_REGEX.test(this.messageControl.value!)) {
        this.socketService.sendMessage(
          this.selectedChatId,
          this.messageControl.value!,
          TypeMessage.Link
        );
      } else {
        this.socketService.sendMessage(
          this.selectedChatId,
          this.messageControl.value!,
          TypeMessage.Text
        );
      }
    }
    if (this.images.length > 0) {
      this.messageControl.setValue('');
      this.socketService.sendDataFiles(
        this.selectedChatId,
        this.images,
        TypeMessage.Image
      );
      this.images = [];
    }
    if (this.files.length > 0) {
      this.messageControl.setValue('');
      this.socketService.sendDataFiles(
        this.selectedChatId,
        this.files,
        TypeMessage.File
      );
      this.files = [];
    }
    this.scrollToBottom();
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

  onScrollUpMessage() {
    this.loadMessageFinished = false;
    this.messageTake += constants.MESSAGE_TAKE;
    this.chatService
      .getChatMessages(this.selectedChatId!, this.messageTake)
      .subscribe((messages) => {
        this.messages = of(messages.reverse());
        this.loadMessageFinished = true;
      });
  }

  getNewMembersOfGroupChat() {
    return combineLatest([
      this.membersOfGroupChat!,
      this.userService.allUser,
      this.userService.currentUserProfile,
    ]).pipe(
      map(([members, allUsers, currentUser]) => {
        return allUsers.filter(
          (user) =>
            !members.find((member) => member.uid === user.uid) &&
            user.uid !== currentUser?.uid
        );
      })
    );
  }

  openCreateChatGroupModal() {
    this.modalService.open(this.createChatGroupModal);
  }

  createNewChatGroup(modal: any) {
    if (this.nameOfNewChatGroup.trim() !== '') {
      this.chatService.createChatGroup(this.nameOfNewChatGroup).subscribe();
      modal.close('Ok click');
    }
  }

  openAddNewMemberModal() {
    this.modalService.open(this.addMemberModal);
  }

  addNewMembersToGroupChat(modal: any) {
    if (this.selectedForm.value.selectedMemberIds.length > 0) {
      const selectedMemberIds = this.selectedForm.value.selectedMemberIds;
      this.socketService.addToGroupChat(
        selectedMemberIds,
        this.selectedChatId!
      );
      this.selectedForm.reset();
      modal.close('Ok click');
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

  uploadFiles() {
    this.fileTransferInput.nativeElement.accept = '*/*';
    this.fileTransferInput.nativeElement.click();
  }

  /**
   * Thêm file ảnh vào list images
   * @param file
   */
  addFileImageToList(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e: any) => {
      const dataImage: DataFile = {
        fileName: file.name,
        base64: e.target.result,
      };
      this.images.push(dataImage);
    };
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
        this.addFileImageToList(file);
      }
    }
  }

  /**
   * Xử lí sự kiện upload các loại file
   * @param event
   */
  onFileTransferSelected(event: any) {
    this.isShowUploadDialog = !this.isShowUploadDialog;
    const files = event.target.files;
    if (files) {
      // Giới hạn dung lượng file 25MB
      const maxFileSize = 25 * 1024 * 1024;
      for (const file of files) {
        if (file.size > maxFileSize) {
          this.toastService.showError(
            `File ${file.name} có kích thước lớn hơn 25MB và sẽ không được xử lý.`
          );
        } else if (this.isFileImage(file)) {
          this.addFileImageToList(file);
        } else {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (e: any) => {
            const dataImage: DataFile = {
              fileName: file.name,
              base64: e.target.result,
            };
            this.files.push(dataImage);
          };
        }
      }
    }
  }

  /**
   * Kiểm tra file ảnh
   * @param file
   */
  isFileImage(file: File) {
    return file.type.split('/')[0] === 'image';
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

  removeFile(index: number) {
    this.files = this.files.filter(
      (file, currentIndex) => currentIndex != index
    );
  }

  openAudioRecorderModal() {
    this.modalService.open(this.audioRecorderModal);
  }

  toggleRecording() {
    this.isRecording = !this.isRecording;
    if (this.isRecording) {
      this.startRecording();
    } else {
      this.stopRecording();
    }
  }

  startRecording() {
    this.audioService.startRecording();
    this.recordingTime = '00:00';
    let elapsedSeconds = 0;
    this.audioURL = '';
    this.recordingInterval = setInterval(() => {
      ++elapsedSeconds;
      this.recordingTime = this.formatTime(elapsedSeconds);
    }, 1000);
  }

  stopRecording() {
    this.audioService.stopRecording().then((audioBlob) => {
      this.audioBlob = audioBlob;
      this.audioURL = window.URL.createObjectURL(audioBlob);
      clearInterval(this.recordingInterval);
    });
  }

  formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return (
      mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0')
    );
  }

  sendAudioRecord(modal: any) {
    this.socketService.sendAudio(this.selectedChatId, this.audioBlob);
    this.audioBlob = null;
    modal.close('Ok click');
  }

  showModalImage(imageURL: any) {
    this.toastService.showImageModal(imageURL);
  }

  callVideo() {
    this.modalService.open(this.callVideoModal, { size: 'xl' });
    this.chatService
      .getChatUserIdsExceptMe(this.selectedChatId)
      .subscribe((userIds) => {
        this.videoCallService.sendOffer(this.selectedChatId, userIds);
      });
  }
}
