import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { DataImage } from 'src/app/components/dashboard/body/chat-page/data-image';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private fileSocket: any;
  private currentUserId!: string;

  constructor() {
    this.fileSocket = io('localhost:4000');

    const accessToken = JSON.parse(localStorage.getItem('access_token') ?? '');
    this.currentUserId = accessToken.user.uid;
    this.fileSocket.emit('login', {
      userId: this.currentUserId
    })

    this.fileSocket.on('images', (response: any) => {
      console.log(response);
    })
  }

  public sendImages(userIdsInChat: string[], chatId: string, images: DataImage[]) {
    const otherUserIds = userIdsInChat.filter((userId) => userId !== this.currentUserId);
    images.forEach((image, index) => {
      this.sendPartsOfImage(otherUserIds, chatId, image, index, images.length);
    })
  }

  /**
   * Gửi từng chunk của image qua server
   * @param image: base64 của image
   * @param index: index của image trong danh sách các image mà client nhấn gửi
   */
  private sendPartsOfImage(otherUserIds: string[], chatId: string, dataImage: DataImage, index: number, imageCount: number) {
    // Gửi từng chunk có kích thước 1MB qua server
    const chunkSize = 1024 * 1024;
    const totalBytes = dataImage.base64.length;
    const totalChunks = Math.ceil(totalBytes / chunkSize);
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min((chunkIndex + 1) * chunkSize, totalBytes);
      const chunk = dataImage.base64.slice(start, end);

      // Gửi từng phần dữ liệu đến server
      this.fileSocket.emit('images', {
        fromUser: this.currentUserId,
        toUsers: otherUserIds,
        chatId,
        imageCount: imageCount,
        fileName: dataImage.fileName,
        imageId: index,
        chunkIndex,
        chunk,
        totalChunks
      });
    }
  }
}
