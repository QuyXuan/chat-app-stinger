import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VideoCallService } from 'src/app/services/video-call/video-call.service';

@Component({
  selector: 'app-video-call-widget',
  templateUrl: './video-call-widget.component.html',
  styleUrls: ['./video-call-widget.component.css'],
})
export class VideoCallWidgetComponent implements OnInit {
  @ViewChild('local_video') localVideo: ElementRef | undefined;
  @ViewChild('received_video') remoteVideo: ElementRef | undefined;

  inCall = false;

  constructor(private videoCallService: VideoCallService) {}

  ngOnInit(): void {
    this.videoCallService.requestMediaDevices();
    this.videoCallService.localStreamUpdated.subscribe((stream) => {
      this.localVideo!.nativeElement.srcObject = stream;
    });
    this.videoCallService.remoteStreamUpdated.subscribe((stream) => {
      this.remoteVideo!.nativeElement.srcObject = stream;
    });
    this.videoCallService.localVideoStateChanged.subscribe((isActive) => {
      if (!isActive) {
        this.localVideo!.nativeElement.srcObject = undefined;
      }
    });
  }

  call() {
    this.videoCallService.call();
  }
}
