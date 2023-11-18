import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { DataImage } from 'src/app/components/dashboard/body/chat-page/data-image';
import { Utils } from 'src/app/helpers/utils';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private tcpSocket: any;

  constructor() {
    this.tcpSocket = io('localhost:3000');
    this.tcpSocket.emit('login', {
      userId: Utils.getUserId()
    })

    this.tcpSocket.on('images', (response: any) => {
      console.log(response);
    })
  }

  public sendImages(chatId: string, images: DataImage[]) {
    images.forEach((image, index) => {
      this.sendPartsOfImage(chatId, image, index, images.length);
    })
  }

  /**
   * Gửi từng chunk của image qua server
   * @param image: base64 của image
   * @param index: index của image trong danh sách các image mà client nhấn gửi
   */
  private sendPartsOfImage(chatId: string, dataImage: DataImage, index: number, imageCount: number) {
    const now = new Date();
    // Gửi từng chunk có kích thước 1MB qua server
    const chunkSize = 1024 * 1024;
    const totalBytes = dataImage.base64.length;
    const totalChunks = Math.ceil(totalBytes / chunkSize);
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min((chunkIndex + 1) * chunkSize, totalBytes);
      const chunk = dataImage.base64.slice(start, end);

      // Gửi từng phần dữ liệu đến server
      this.tcpSocket.emit('images', {
        chatId,
        imageCount: imageCount,
        fileName: dataImage.fileName,
        sendAt: now,
        imageId: index,
        chunkIndex,
        chunk,
        totalChunks
      });
    }
  }
}
