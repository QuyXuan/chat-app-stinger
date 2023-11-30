import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SocketService } from '../socket-service/socket.service';

const mediaConstraints = {
  audio: true,
  video: { width: 1280, height: 720 },
};

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

@Injectable({
  providedIn: 'root',
})
export class VideoCallService {
  private peerConnection: RTCPeerConnection | undefined;
  public localStream: MediaStream | undefined;
  public localStreamUpdated: EventEmitter<MediaStream> = new EventEmitter();
  public remoteStream: MediaStream | undefined;
  public remoteStreamUpdated: EventEmitter<MediaStream> = new EventEmitter();
  public localVideoActive: boolean = false;
  public localVideoStateChanged: EventEmitter<boolean> = new EventEmitter();

  constructor(private socketService: SocketService) {
    this.socketService.videoOfferObservable.subscribe({
      next: (response) => {
        debugger;
        console.log('received video offer');
        this.receiveOffer(response.response.fromUser, response.response.offer);
      },
    });
    this.socketService.videoAnswerObservable.subscribe({
      next: (response) => {
        debugger;
        console.log('received video answer');
        this.receiveAnswer(response.response.answer);
      },
    });
  }

  async sendOffer(chatId: string, chatUserIds: string[]) {
    try {
      debugger;
      const offer = await this.peerConnection?.createOffer(offerOptions);
      await this.peerConnection!.setLocalDescription(offer);
      this.socketService.sendVideoOffer(chatId, chatUserIds, offer!);
    } catch (error) {
      this.handleGetUserMediaError(error as Error);
    }
  }

  async receiveOffer(toUser: string, offer: RTCSessionDescriptionInit) {
    debugger;
    if (!this.peerConnection!.currentRemoteDescription && offer) {
      await this.peerConnection!.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);
      this.socketService.sendVideoAnswer(toUser, answer);
    }
  }

  async receiveAnswer(answer: RTCSessionDescriptionInit) {
    debugger;
    if (this.peerConnection!.signalingState === 'have-local-offer') {
      await this.peerConnection!.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    } else {
      console.log(
        'Cannot set remote answer in current state:',
        this.peerConnection!.signalingState
      );
    }
  }

  async call(): Promise<void> {
    debugger;
    this.localStream!.getTracks().forEach((track) =>
      this.peerConnection!.addTrack(track, this.localStream!)
    );
    this.startLocalVideo();
    try {
      const offer: RTCSessionDescriptionInit =
        await this.peerConnection!.createOffer(offerOptions);
      await this.peerConnection!.setLocalDescription(offer);
    } catch (err) {
      this.handleGetUserMediaError(err as Error);
    }
  }

  async requestMediaDevices(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints
      );
      this.createPeerConnection();
      this.pauseLocalVideo();
    } catch (e) {
      console.error(e);
      alert(`getUserMedia() error: ${e}`);
    }
  }

  startLocalVideo(): void {
    debugger;
    console.log('starting local stream');
    this.requestMediaDevices().then(() => {
      this.localStream!.getTracks().forEach((track) => {
        track.enabled = true;
      });
      this.localStreamUpdated.emit(this.localStream!);
    });

    this.localVideoActive = true;
  }

  pauseLocalVideo(): void {
    debugger;
    console.log('pause local stream');
    if (this.localStream) {
      this.localStream!.getTracks().forEach((track) => {
        track.enabled = false;
      });
    }
    this.localVideoActive = false;
    this.localVideoStateChanged.emit(this.localVideoActive);
  }

  private createPeerConnection(): void {
    debugger;
    console.log('creating PeerConnection...');
    this.peerConnection! = new RTCPeerConnection(
      environment.RTCPeerConfiguration
    );
    this.peerConnection!.onicecandidate = this.handleICECandidateEvent;
    this.peerConnection!.oniceconnectionstatechange =
      this.handleICEConnectionStateChangeEvent;
    this.peerConnection!.onsignalingstatechange =
      this.handleSignalingStateChangeEvent;
    this.peerConnection!.ontrack = this.handleTrackEvent;
  }

  private closeVideoCall(): void {
    debugger;
    console.log('Closing call');

    if (this.peerConnection!) {
      console.log('--> Closing the peer connection');

      this.peerConnection!.ontrack = null;
      this.peerConnection!.onicecandidate = null;
      this.peerConnection!.oniceconnectionstatechange = null;
      this.peerConnection!.onsignalingstatechange = null;

      this.peerConnection!.getTransceivers().forEach((transceiver) => {
        transceiver.stop();
      });
      this.peerConnection!.close();
      this.peerConnection = undefined;
    }
  }

  /* ########################  ERROR HANDLER  ################################## */
  private handleGetUserMediaError(e: Error): void {
    switch (e.name) {
      case 'NotFoundError':
        alert(
          'Unable to open your call because no camera and/or microphone were found.'
        );
        break;
      case 'SecurityError':
      case 'PermissionDeniedError':
        break;
      default:
        console.log(e);
        alert('Error opening your camera and/or microphone: ' + e.message);
        break;
    }

    this.closeVideoCall();
  }

  /* ########################  EVENT HANDLER  ################################## */
  private handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
    console.log(event);
    if (event.candidate) {
      this.socketService.sendToPeer('iceCandidate', {
        candidate: event.candidate,
      });
    }
  };

  private handleICEConnectionStateChangeEvent = (event: Event) => {
    console.log(event);
    switch (this.peerConnection!.iceConnectionState) {
      case 'closed':
      case 'failed':
      case 'disconnected':
        this.closeVideoCall();
        break;
    }
  };

  private handleSignalingStateChangeEvent = (event: Event) => {
    console.log(event);
    switch (this.peerConnection!.signalingState) {
      case 'closed':
        this.closeVideoCall();
        break;
    }
  };

  private handleTrackEvent = (event: RTCTrackEvent) => {
    console.log(event);
    debugger;
    this.remoteStream = event.streams[0];
    this.remoteStreamUpdated.emit(this.remoteStream!);
  };
}
