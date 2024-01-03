import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { DataFile } from 'src/app/components/dashboard/body/chat-page/data-file';
import { ChatService } from '../chat/chat.service';
import { TypeMessage } from 'src/app/models/type-message';
import { UserService } from '../user/user.service';
import { Utils } from 'src/app/helpers/utils';
import { Observable, Subject } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public tcpSocket: any;
  private currentUserId!: string;
  private callUserSubject = new Subject<any>();
  public get callUserObservable(): Observable<any> {
    return this.callUserSubject.asObservable();
  }

  private triggerMicrophoneSubject = new Subject<any>();
  public get triggerMicrophoneObservable(): Observable<any> {
    return this.triggerMicrophoneSubject.asObservable();
  }

  private triggerCameraSubject = new Subject<any>();
  public get triggerCameraObservable(): Observable<any> {
    return this.triggerCameraSubject.asObservable();
  }

  private triggerShareScreenSubject = new Subject<any>();
  public get triggerShareScreenObservable(): Observable<any> {
    return this.triggerShareScreenSubject.asObservable();
  }

  private leaveCallSubject = new Subject<any>();
  public get leaveCallObservable(): Observable<any> {
    return this.leaveCallSubject.asObservable();
  }

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private toastService: ToastService
  ) {
    this.tcpSocket = io(environment.serverRemote);

    const accessTokenString = localStorage.getItem('access_token') ?? '';
    if (accessTokenString) {
      const accessToken = JSON.parse(accessTokenString);
      this.currentUserId = accessToken.user.uid;
      this.tcpSocket.emit('login', {
        userId: this.currentUserId,
      });
    }

    this.tcpSocket.on('addToGroupChat', (response: any) => {
      this.userService.getUsersById(response.newUserIds).subscribe((users) => {
        this.chatService
          .addMemberToGroupChat(users, response.chatId)
          .subscribe();
      });
    });

    this.tcpSocket.on('callUser', (data: any) => {
      this.userService
        .getUsersById([data.response.fromUser])
        .subscribe((users) => {
          this.toastService.showOfferCallVideo(users[0].displayName!, () => {
            this.chatService.openVideoCallSubject.next({
              isOpened: true,
              chatId: data.response.chatId,
              sendData: () => {
                this.callUserSubject.next(data);
              },
            });
          });
        });
    });

    this.tcpSocket.on('triggerMicrophone', (data: any) => {
      this.triggerMicrophoneSubject.next(data);
    });

    this.tcpSocket.on('triggerCamera', (data: any) => {
      this.triggerCameraSubject.next(data);
    });

    this.tcpSocket.on('triggerShareScreen', (data: any) => {
      this.triggerShareScreenSubject.next(data);
    });

    this.tcpSocket.on('leaveCall', (data: any) => {
      this.leaveCallSubject.next(data);
    });
  }

  public sendIsLoggedIn() {
    this.currentUserId = Utils.getUserId();
    this.tcpSocket.emit('login', {
      userId: this.currentUserId,
    });
  }

  public sendIsLogout() {
    this.currentUserId = '';
    this.tcpSocket.emit('logout', {});
  }

  public sendDataFiles(
    chatId: string,
    dataFiles: DataFile[],
    type: TypeMessage
  ) {
    dataFiles.forEach((dataFile, index) => {
      this.sendPartsOfDataFiles(
        chatId,
        dataFile,
        index,
        dataFiles.length,
        type
      );
    });
  }

  /**
   * Gửi từng chunk của image qua server
   * @param image: base64 của image
   * @param index: index của image trong danh sách các image mà client nhấn gửi
   */
  private sendPartsOfDataFiles(
    chatId: string,
    dataFile: DataFile,
    index: number,
    dataFilesCount: number,
    type: TypeMessage
  ) {
    // Gửi từng chunk có kích thước 1MB qua server
    const chunkSize = 1024 * 1024;
    const totalBytes = dataFile.base64.length;
    const totalChunks = Math.ceil(totalBytes / chunkSize);
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min((chunkIndex + 1) * chunkSize, totalBytes);
      const chunk = dataFile.base64.slice(start, end);

      // Gửi từng phần dữ liệu đến server
      this.tcpSocket.emit('dataFiles', {
        fromUser: this.currentUserId,
        chatId,
        dataFilesCount: dataFilesCount,
        fileName: dataFile.fileName,
        dataFileId: index,
        chunkIndex,
        chunk,
        totalChunks,
        type,
      });
    }
  }

  public sendMessage(chatId: string, text: string, type: TypeMessage) {
    this.tcpSocket.emit('text', {
      fromUser: this.currentUserId,
      chatId: chatId,
      text: text,
      type: type,
    });
  }

  public addToGroupChat(newUserIds: string[], chatId: string) {
    this.tcpSocket.emit('addToGroupChat', {
      fromUser: this.currentUserId,
      newUserIds: newUserIds,
      chatId: chatId,
    });
  }

  public sendAudio(chatId: string, audioBlob: Blob) {
    const CHUNK_SIZE = 1024 * 1024;
    const totalBytes = audioBlob.size;
    const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE);
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min((chunkIndex + 1) * CHUNK_SIZE, totalBytes);
      const chunk = audioBlob.slice(start, end);

      this.tcpSocket.emit('audio', {
        fromUser: this.currentUserId,
        chatId: chatId,
        chunkIndex: chunkIndex,
        chunk: chunk,
        totalChunks: totalChunks,
      });
    }
  }

  public sendRequestAddAcceptNewFriend(receiver: string, eventName: string) {
    this.userService.getUserIdByEmail(receiver).then((newFriendId) => {
      if (newFriendId) {
        this.tcpSocket.emit(eventName, {
          newFriendId,
        });
      }
    });
  }

  public updateDoc(docId: string, content: string, changeBy: string) {
    this.tcpSocket.emit('updateDoc', {
      fromUser: this.currentUserId,
      docId: docId,
      content: content,
      changeBy: changeBy,
    });
  }

  public editMessageContent(
    chatId: string,
    messageId: string,
    newContent: string
  ) {
    this.tcpSocket.emit('editMessageContent', {
      chatId,
      messageId,
      newContent,
    });
  }

  public deleteMessage(chatId: string, messageId: string) {
    this.tcpSocket.emit('deleteMessage', {
      chatId,
      messageId,
    });
  }

  public sendVideoOffer(
    chatId: string,
    chatUserIds: string[],
    offer: RTCSessionDescriptionInit
  ) {
    this.tcpSocket.emit('videoOffer', {
      fromUser: this.currentUserId,
      chatId: chatId,
      chatUserIds: chatUserIds,
      offer: offer,
    });
  }

  public sendVideoAnswer(toUser: string, answer: RTCSessionDescriptionInit) {
    this.tcpSocket.emit('videoAnswer', {
      fromUser: this.currentUserId,
      toUser: toUser,
      answer: answer,
    });
  }

  public callUser(chatId: string, chatUserIds: string[], signalData: any) {
    this.tcpSocket.emit('callUser', {
      chatId: chatId,
      fromUser: this.currentUserId,
      chatUserIds: chatUserIds,
      signalData: signalData,
    });
  }

  public answerCall(chatId: string, chatUserIds: string[], signalData: any) {
    this.tcpSocket.emit('answerCall', {
      chatId: chatId,
      fromUser: this.currentUserId,
      chatUserIds: chatUserIds,
      signalData: signalData,
    });
  }

  public triggerMicrophone(
    chatId: string,
    chatUserIds: string[],
    isMuted: boolean
  ) {
    this.tcpSocket.emit('triggerMicrophone', {
      fromUser: this.currentUserId,
      chatId: chatId,
      chatUserIds: chatUserIds,
      isMuted: isMuted,
    });
  }

  public triggerCamera(
    chatId: string,
    chatUserIds: string[],
    isOpened: boolean
  ) {
    this.tcpSocket.emit('triggerCamera', {
      fromUser: this.currentUserId,
      chatId: chatId,
      chatUserIds: chatUserIds,
      isOpened: isOpened,
    });
  }

  public triggerShareScreen(
    chatId: string,
    chatUserIds: string[],
    isShared: boolean
  ) {
    this.tcpSocket.emit('triggerShareScreen', {
      fromUser: this.currentUserId,
      chatId: chatId,
      chatUserIds: chatUserIds,
      isShared: isShared,
    });
  }

  public leaveCall(chatId: string, chatUserIds: string[]) {
    this.tcpSocket.emit('leaveCall', {
      fromUser: this.currentUserId,
      chatId: chatId,
      chatUserIds: chatUserIds,
    });
  }
}
