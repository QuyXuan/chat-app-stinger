import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  faMicrophoneLinesSlash,
  faMicrophoneLines,
  faVideoSlash,
  faVideo,
  faPhoneSlash,
  faPhone,
  faEyeSlash,
  faEye,
  faPhoneAlt,
} from '@fortawesome/free-solid-svg-icons';
import { SignalData } from 'simple-peer';
import { ChatService } from 'src/app/services/chat/chat.service';
import { SocketService } from 'src/app/services/socket-service/socket.service';
import { ToastService } from 'src/app/services/toast/toast.service';
@Component({
  selector: 'app-video-call-widget',
  templateUrl: './video-call-widget.component.html',
  styleUrls: ['./video-call-widget.component.css'],
})
export class VideoCallWidgetComponent implements OnInit {
  @ViewChild('content_video') contentVideo: ElementRef | undefined;
  @ViewChild('local_video') localVideo: ElementRef | undefined;
  @ViewChild('remote_video') remoteVideo: ElementRef | undefined;
  @Input() videoModal: any;
  stream!: MediaStream;
  remoteStream!: MediaStream;
  callerSignal: any;
  connectionRef: any;
  chatUserIds: string[] = [];
  selectedChatId: string = '';
  isMutedLocal: boolean = false;
  isMutedRemote: boolean = false;
  isMutedContent: boolean = false;
  isOpenedLocal: boolean = true;
  isShareScreen: boolean = false;
  isFirstShare: boolean = true;
  isInCall: boolean = false;

  faIcon = {
    faMicrophoneLinesSlash: faMicrophoneLinesSlash,
    faMicrophoneLines: faMicrophoneLines,
    faVideoSlash: faVideoSlash,
    faVideo: faVideo,
    faPhoneSlash: faPhoneSlash,
    faPhone: faPhone,
    faEyeSlash: faEyeSlash,
    faEye: faEye,
    faPhoneAlt: faPhoneAlt,
  };

  constructor(
    private socketService: SocketService,
    private chatService: ChatService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream: MediaStream) => {
        this.stream = stream;
        this.localVideo!.nativeElement.srcObject = stream;
      });
    this.socketService.callUserObservable.subscribe({
      next: (data) => {
        this.callerSignal = data.response.signalData;
        this.isInCall = true;
        this.answerCall();
      },
    });
    this.chatService.chatUserIdsObservable.subscribe({
      next: (data) => {
        this.chatUserIds = data.chatUserIds;
        this.selectedChatId = data.selectedChatId;
      },
    });
    this.socketService.triggerMicrophoneObservable.subscribe({
      next: (data) => {
        this.isMutedRemote = data.response.isMuted;
        if (!this.isShareScreen) {
          this.isMutedContent = data.response.isMuted;
        }
      },
    });
    this.socketService.triggerCameraObservable.subscribe({
      next: (data) => {
        if (this.isShareScreen) {
          this.remoteVideo!.nativeElement.srcObject = data.response.remoteStream
            ? this.remoteStream
            : null;
        } else {
          this.contentVideo!.nativeElement.srcObject = data.response.isOpened
            ? this.remoteStream
            : null;
        }
      },
    });
    this.socketService.triggerShareScreenObservable.subscribe({
      next: (data) => {
        this.isShareScreen = data.response.isShared;
        this.isFirstShare = false;
        if (this.isShareScreen) {
          this.remoteVideo!.nativeElement.srcObject = this.stream;
          console.log(this.remoteStream);
        } else {
          this.contentVideo!.nativeElement.srcObject = this.remoteStream;
          this.remoteVideo!.nativeElement.srcObject = null;
        }
      },
    });
    this.socketService.leaveCallObservable.subscribe({
      next: (data) => {
        this.videoModal!.close('Ok click');
      },
    });
  }

  callUser() {
    if (this.isInCall) {
      this.toastService.showError('You have in a call');
      return;
    }
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: this.stream,
    });
    peer.on('signal', (data: SignalData) => {
      this.socketService.callUser(this.selectedChatId, this.chatUserIds, data);
    });
    this.socketService.tcpSocket.on('callAccepted', (data: any) => {
      peer.signal(data.response.signalData);
      peer.on('stream', (stream: MediaStream) => {
        this.remoteStream = stream;
        this.contentVideo!.nativeElement.srcObject = stream;
      });
    });
    this.connectionRef = peer;
    this.isInCall = true;
  }

  answerCall() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream: MediaStream) => {
        if (!this.stream) {
          this.stream = stream;
          this.localVideo!.nativeElement.srcObject = stream;
        }
      })
      .then(() => {
        const peer = new SimplePeer({
          initiator: false,
          trickle: false,
          stream: this.stream,
        });
        peer.on('signal', (data: SignalData) => {
          this.socketService.answerCall(
            this.selectedChatId,
            this.chatUserIds,
            data
          );
        });
        peer.on('stream', (stream: MediaStream) => {
          this.remoteStream = stream;
          console.log(stream);
          this.contentVideo!.nativeElement.srcObject = stream;
        });
        peer.signal(this.callerSignal);
      });
  }

  triggerMicrophone() {
    this.isMutedLocal = !this.isMutedLocal;
    this.socketService.triggerMicrophone(
      this.selectedChatId,
      this.chatUserIds,
      this.isMutedLocal
    );
  }

  triggerCamera() {
    this.isOpenedLocal = !this.isOpenedLocal;
    this.socketService.triggerCamera(
      this.selectedChatId,
      this.chatUserIds,
      this.isOpenedLocal
    );
  }

  leaveCall() {
    this.videoModal!.close('Ok click');
    this.socketService.leaveCall(this.selectedChatId, this.chatUserIds);
  }

  shareScreen() {
    if (this.isFirstShare && !this.isShareScreen && this.isInCall) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true })
        .then((stream: MediaStream) => {
          this.isShareScreen = true;
          this.isMutedContent = false;
          this.contentVideo!.nativeElement.srcObject = stream;
          this.remoteVideo!.nativeElement.srcObject = this.remoteStream;
          this.connectionRef.replaceTrack(
            this.connectionRef.streams[0]
              .getTracks()
              .find((track: any) => track.kind === 'video'),
            stream.getTracks()[0],
            this.connectionRef.streams[0]
          );
          this.socketService.triggerShareScreen(
            this.selectedChatId,
            this.chatUserIds,
            this.isShareScreen
          );
        });
    } else {
      this.toastService.showError('Cannot share screen');
    }
  }
}
