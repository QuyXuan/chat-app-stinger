import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  mediaRecorder: any;
  chunks: any[] = [];
  audioURL = '';
  constructor() {
    this.checkMediaDevices();
  }
  checkMediaDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorder.ondataavailable = (e: any) => {
            this.chunks.push(e.data);
          };
          this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.chunks, {
              type: 'audio/ogg; codecs=opus',
            });
            this.chunks = [];
            this.audioURL = window.URL.createObjectURL(blob);
          };
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  startRecording() {
    this.audioURL = '';
    this.mediaRecorder.start();
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, {
          type: 'audio/ogg; codecs=opus',
        });
        this.chunks = [];
        this.audioURL = window.URL.createObjectURL(blob);
        resolve(blob);
      };
      this.mediaRecorder.onerror = (error: any) => {
        reject(null);
      };
      this.mediaRecorder.stop();
    });
  }

  downloadAudio() {
    const downloadLink = document.createElement('a');
    downloadLink.href = this.audioURL;
    downloadLink.download = 'audio';
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
