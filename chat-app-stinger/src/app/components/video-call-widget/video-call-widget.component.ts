import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from 'src/app/services/chat/chat.service';
import { SocketService } from 'src/app/services/socket-service/socket.service';
@Component({
  selector: 'app-video-call-widget',
  templateUrl: './video-call-widget.component.html',
  styleUrls: ['./video-call-widget.component.css'],
})
export class VideoCallWidgetComponent implements OnInit {
  @ViewChild('local_video') localVideo: ElementRef | undefined;
  @ViewChild('received_video') remoteVideo: ElementRef | undefined;
  me: string = '';
  stream!: MediaStream;
  receivingCall: boolean = false;
  caller: string = '';
  callerSignal: any;
  callAccepted: boolean = false;
  idToCall: string = '';
  callEnded: boolean = false;
  name: string = '';
  connectionRef: any;
  chatUserIds: string[] = [];

  constructor(
    private socketService: SocketService,
    private chatService: ChatService
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
        this.receivingCall = true;
        this.caller = data.response.fromUser;
        this.callerSignal = data.response.signalData;
        this.answerCall();
      },
    });
    this.chatService.chatUserIdsObservable.subscribe({
      next: (chatUserIds) => {
        this.chatUserIds = chatUserIds;
      },
    });
  }

  callUser() {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: this.stream,
    });
    peer.on('signal', (data) => {
      this.socketService.callUser(this.chatUserIds, data);
    });
    peer.on('stream', (stream: MediaStream) => {
      this.localVideo!.nativeElement.srcObject = stream;
    });
    this.socketService.tcpSocket.on('callAccepted', (data: any) => {
      this.callAccepted = true;
      peer.signal(data.response.signalData);
      peer.on('stream', (stream) => {
        this.remoteVideo!.nativeElement.srcObject = stream;
      });
    });
    this.connectionRef = peer;
  }

  answerCall() {
    this.callAccepted = true;
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: this.stream,
    });
    peer.on('signal', (data) => {
      this.socketService.answerCall(this.caller, data);
    });
    peer.on('stream', (stream: MediaStream) => {
      this.remoteVideo!.nativeElement.srcObject = stream;
    });
    peer.signal(this.callerSignal);
    this.connectionRef = peer;
  }

  leaveCall() {
    this.callEnded = true;
    this.connectionRef.destroy();
  }
}
