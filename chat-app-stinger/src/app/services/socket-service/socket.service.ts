import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { DataFile } from 'src/app/components/dashboard/body/chat-page/data-file';
import { ChatService } from '../chat/chat.service';
import { TypeMessage } from 'src/app/models/type-message';
import { UserService } from '../user/user.service';
import { environment } from 'src/environments/environment';
import { Utils } from 'src/app/helpers/utils';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private tcpSocket: any;
  private currentUserId!: string;

  constructor(
    private chatService: ChatService,
    private userService: UserService
  ) {
    // this.tcpSocket = io(environment.serverRemote);
    this.tcpSocket = io('localhost:3000');

    const accessToken = JSON.parse(localStorage.getItem('access_token') ?? '');
    this.currentUserId = accessToken.user.uid;
    this.tcpSocket.emit('login', {
      userId: this.currentUserId,
    });

    this.tcpSocket.on('addToGroupChat', (response: any) => {
      this.userService.getUsersById(response.newUserIds).subscribe((users) => {
        this.chatService
          .addMemberToGroupChat(users, response.chatId)
          .subscribe();
      });
    });
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

  public editMessageContent(chatId: string, messageId: string, newContent: string) {
    this.tcpSocket.emit('editMessageContent', {
      chatId,
      messageId,
      newContent
    });
  }

  public deleteMessage(chatId: string, messageId: string) {
    this.tcpSocket.emit('deleteMessage', {
      chatId,
      messageId
    });
  }
}
