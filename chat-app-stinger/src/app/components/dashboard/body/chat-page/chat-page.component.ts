import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  faFile,
  faUserEdit,
  faFaceSmile,
  faTrash,
  faPencil,
  faCheck,
  faXmark,
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
import { DataFile, wrapperInputContent } from './data-file';
import { constants } from 'src/app/constants';
import { AudioService } from 'src/app/services/audio/audio.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Utils } from 'src/app/helpers/utils';
import { Timestamp } from '@angular/fire/firestore';
import { DocService } from 'src/app/services/doc-service/doc.service';
import { Doc } from 'src/app/models/doc';
import { emojiMap } from './emoji-data';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
})
export class ChatPageComponent implements OnInit {
  @ViewChild('inputContentElement') inputContentElement!: ElementRef;
  @ViewChild('editMessageContentElement')
  editMessageContentElement!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('endOfChat') endOfChat: ElementRef | undefined;
  @ViewChild('create_chat_group') createChatGroupModal: ElementRef | undefined;
  @ViewChild('add_member') addMemberModal: ElementRef | undefined;
  @ViewChild('audio_recorder') audioRecorderModal: ElementRef | undefined;
  @ViewChild('doc_list') docListModal: ElementRef | undefined;
  @ViewChild('call_video') callVideoModal: ElementRef | undefined;
  @ViewChild('fileTransferInput')
  fileTransferInput!: ElementRef<HTMLInputElement>;

  isShowChatSidebar: boolean = true;
  isShowUploadDialog: boolean = false;
  isShowEditMessageBlock: boolean = false;
  isRecording = false;
  recordingTime = '00:00';
  recordingInterval: any;
  audioBlob: any;
  audioURL = '';
  docs: Observable<Doc[]> | undefined;

  // Data liên quan đến input của textarea và input của edit textarea
  textAreaInput: wrapperInputContent = {
    content: '',
    currentRows: 1,
  };

  textAreaInputEdit: wrapperInputContent = {
    initialContent: '',
    content: '',
    currentRows: 1,
  };

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
    faFile: faFile,
    faUserEdit: faUserEdit,
    faSmile: faFaceSmile,
    faTrash: faTrash,
    faPencil: faPencil,
    faCheck: faCheck,
    faXMark: faXmark,
  };

  selectedForm: FormGroup = new FormGroup({});
  searchControl = new FormControl('');
  messageControl = new FormControl('');
  currentUser = this.userService.currentUserProfile;

  // Current user info
  currentUserId!: string;
  displayName!: string;
  avatar!: string;

  selectedChatId = '';
  editedMessageElement?: HTMLParagraphElement;
  editedMessageId = '';
  nameOfNewChatGroup = '';
  isGroupChat = false;
  messageTake = constants.MESSAGE_TAKE;
  loadMessageFinished = true;
  nameOfNewDoc = '';
  currentOptionsMenu!: HTMLElement;
  isAllowScrollToBottom: boolean = true;

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
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private chatService: ChatService,
    private router: Router,
    private dataService: DataTransferService,
    private socketService: SocketService,
    private modalService: ModalService,
    private formBuilder: FormBuilder,
    private audioService: AudioService,
    private toastService: ToastService,
    private docService: DocService
  ) {
    this.currentUserId = Utils.getUserId();
    this.selectedForm = this.formBuilder.group({
      selectedMemberIds: [],
    });

    this.currentUser.subscribe((profileUser) => {
      this.avatar = profileUser?.photoURL ?? constants.DEFAULT_AVATAR_URL;
      this.displayName = profileUser?.displayName ?? 'Stinger';
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
    this.chatService.openVideoCallObservable.subscribe({
      next: async (data) => {
        if (data.isOpened) {
          this.selectedChatId = data.chatId;
          try {
            await this.callVideo();
            data.sendData();
          } catch (error) {
            console.log(error);
          }
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
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
    this.chatService.deleteMessageObservable.subscribe({
      next: (data) => {
        this.socketService.deleteMessage(data.chatId, data.messageId);
      }
    })
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

        // Chỉ cho phép lúc mới vào và lúc nhấn gửi tin nhắn, tránh trường hợp
        // Observable lắng nghe sự kiện thì cuộn xuống dưới cùng
        this.isAllowScrollToBottom = false;
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
        const content = this.messageControl.value!;
        this.addMessageIntoPageImmediately(TypeMessage.Link, content);
        this.socketService.sendMessage(
          this.selectedChatId,
          content,
          TypeMessage.Link
        );
      } else {
        const content = this.messageControl.value!.replaceAll('\n', '<br/>');
        this.addMessageIntoPageImmediately(TypeMessage.Text, content);
        this.socketService.sendMessage(
          this.selectedChatId,
          content,
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
    this.isAllowScrollToBottom = true;
    this.scrollToBottom();
    this.messageControl.setValue('');
    this.textAreaInput.currentRows = 1;
  }

  createMessage(typeMessage: string, content: string): Message {
    return {
      text: content,
      senderId: this.currentUserId,
      sentDate: Timestamp.now(),
      type: typeMessage,
      displayName: this.displayName,
      avatar: this.avatar,
    };
  }

  addMessageIntoPageImmediately(typeMessage: string, content: string) {
    const newMessage = this.createMessage(typeMessage, content);
    this.messages?.subscribe((currentMessages) => {
      currentMessages.push(newMessage);
      this.messages = new Observable<Message[]>((observer) => {
        observer.next([...currentMessages]);
      });
    });
  }

  getUsersInChat(chatId: string) {
    this.chatService
      .getUserIdsInChat(chatId)
      .then((userIds) => {
        this.userIdsInChat = userIds;
        this.docs = this.docService.getDocs(
          this.userIdsInChat,
          this.selectedChatId
        );
      })
      .catch((error) => {
        console.log('getUsersInChat: ', error);
      });
  }

  scrollToBottom() {
    if (this.endOfChat && this.isAllowScrollToBottom) {
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
  onKeyDown(event: KeyboardEvent, data: wrapperInputContent) {
    const lines = data.content.split('\n');
    if (event.key === 'Backspace' || event.key === 'Delete') {
      const lastLine = lines[lines.length - 1];
      // Nếu hàng cuối cùng trống, giảm số hàng
      if (lines.length == 1 || lastLine.trim() === '') {
        data.currentRows = data.content.split('\n').length;
        data.currentRows = Math.min(Math.max(data.currentRows - 1, 1), 10);
      }
    } else if (event.shiftKey && event.key === 'Enter') {
      data.currentRows++;
      data.currentRows = Math.min(data.currentRows, 10);
    } else if (event.key === 'Enter') {
      // Nếu là Enter thì không cho nhảy xuống hàng mà gửi luôn
      event.preventDefault();
    }
  }

  onInput($event: any, data: wrapperInputContent) {
    // Kiểm tra xem có dãy kí tự emoji nào phù hợp
    data.content = data.content.replace(/:(\w+|\)|\()/g, (match, p1) => {
      const emoji = emojiMap.get(`:${p1}`);
      return emoji ?? match;
    });
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
            `The file size exceeds 25MB. Please choose another file.`
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

  handlePaste(event: any, textarea: wrapperInputContent) {
    const items = (event.clipboardData || event.originalEvent.clipboardData)
      .items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();

        if (blob) {
          this.addFileImageToList(blob);
        }
      } else if (item.type.indexOf('text/plain') !== -1) {
        const text =
          textarea.content + event.clipboardData.getData('text/plain');
        textarea.currentRows = Math.min(
          this.calculateNumberOfLines(
            text,
            textarea == this.textAreaInput
              ? this.inputContentElement.nativeElement
              : this.editMessageContentElement.nativeElement
          ),
          10
        );
      }
    }
  }

  /**
   * Tính toán số hàng cần để hiển thị nội dung khi paste 1 văn bản vào ô input
   * @param textContent: nội dung chữ đang có trong ô input
   * @param inputElement
   * @returns
   */
  private calculateNumberOfLines(
    textContent: string,
    inputElement: HTMLInputElement
  ): number {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      // Trình duyệt không hỗ trợ canvas
      return 1;
    }

    context.font = getComputedStyle(inputElement).font;

    // Tính tổng số hàng được dùng để hiển thị text
    // Chiều rộng hiện tại của input
    const inputWidth = inputElement.clientWidth;
    let totalLines = 0;
    const textInLines: string[] = textContent.split('\n');
    totalLines += textInLines.length;
    textInLines.forEach((text) => {
      const line = Math.ceil(context.measureText(text).width / inputWidth);
      totalLines += line - 1;
    });

    // Tính số hàng dựa trên chiều dài của nội dung và chiều rộng của input
    return totalLines;
  }

  openDocumentModal() {
    this.modalService.open(this.docListModal);
  }

  createDoc(modal: any) {
    if (this.nameOfNewDoc.trim() !== '') {
      this.docService
        .createDoc(
          this.userIdsInChat,
          this.selectedChatId,
          this.nameOfNewDoc.trim()
        )
        .subscribe((docId) => {
          this.router.navigate(['/docs', docId]);
        });
    }
    modal.close('Ok click');
  }

  openDoc(docId: string, modal: any) {
    modal.close('Ok click');
    this.router.navigate(['/docs', docId]);
  }

  //#region Sửa, xoá message
  closeOptionsMenu() {
    if (this.currentOptionsMenu) {
      this.currentOptionsMenu.classList.add('hidden');
    }
  }

  openOptionsMenu(event: MouseEvent) {
    const button = event.target as HTMLElement;
    const optionsMenu = button
      .closest('.options-block')
      ?.querySelector('.options-menu') as HTMLElement | null;
    if (optionsMenu) {
      this.currentOptionsMenu = optionsMenu;
      optionsMenu.classList.toggle('hidden');
    }
    event.stopPropagation();
  }

  handleEditMessage(event: MouseEvent, messageId?: string) {
    this.editedMessageId = messageId ?? '';
    const button = event.target as HTMLElement;
    this.editedMessageElement =
      button
        .closest('.message-text-block')
        ?.querySelector('.chat-bubble .message-text') ?? undefined;
    this.textAreaInputEdit.content =
      button
        .closest('.message-text-block')
        ?.querySelector('.chat-bubble .message-text')
        ?.innerHTML.replaceAll('<br>', '\n') ?? '';
    this.textAreaInputEdit.initialContent = this.textAreaInputEdit.content;

    // Tính toán lại số hàng của textarea sau khi gán dữ liệu mới vào
    this.isShowEditMessageBlock = true;

    // Gọi detectChanges() để cập nhật lại DOM vì trước đây textAreaInputEdit chưa được thêm vào DOM vì ban đầu bị hidden
    this.cdr.detectChanges();

    this.textAreaInputEdit.currentRows = Math.min(
      this.calculateNumberOfLines(
        this.textAreaInputEdit.content,
        this.editMessageContentElement.nativeElement
      ),
      10
    );
  }

  acceptChangeMessage() {
    if (
      this.textAreaInputEdit.content &&
      this.textAreaInputEdit.content != this.textAreaInputEdit.initialContent
    ) {
      if (this.editedMessageElement) {
        this.editedMessageElement.innerHTML =
          this.textAreaInputEdit.content.replaceAll('\n', '<br/>');
      }
      this.socketService.editMessageContent(
        this.selectedChatId,
        this.editedMessageId,
        this.textAreaInputEdit.content.replaceAll('\n', '<br/>')
      );
      this.isShowEditMessageBlock = false;
      this.isAllowScrollToBottom = false;
    }
  }

  handleDeleteMessage(event: MouseEvent, messageId?: string) {
    this.toastService.showWarningDeleteMessage(
      event,
      this.selectedChatId,
      messageId
    );
  }
  //#endregion

  async callVideo() {
    return new Promise((resolve, reject) => {
      this.modalService.open(this.callVideoModal, { size: 'xl' }, false, false);
      this.chatService.getChatUserIdsExceptMe(this.selectedChatId).subscribe({
        next: (userIds) => {
          this.chatService.chatUserIdsSubject.next({
            selectedChatId: this.selectedChatId,
            chatUserIds: userIds,
          });
          resolve({});
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }
}
