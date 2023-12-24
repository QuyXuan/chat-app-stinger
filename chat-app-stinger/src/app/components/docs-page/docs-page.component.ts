import { Component, HostListener, OnInit } from '@angular/core';
import {
  faArrowLeft,
  faDownload,
  faUserEdit,
} from '@fortawesome/free-solid-svg-icons';
import { ContentChange, SelectionChange } from 'ngx-quill';
import { Location } from '@angular/common';
import { DocService } from 'src/app/services/doc-service/doc.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Timestamp } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket-service/socket.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-docs-page',
  templateUrl: './docs-page.component.html',
  styleUrls: ['./docs-page.component.css'],
})
export class DocsPageComponent implements OnInit {
  faIcon = {
    faArrowLeft: faArrowLeft,
    faDownload: faDownload,
    faUserEdit: faUserEdit,
  };

  private docDataSubscription?: Subscription;

  docId: string = '';
  content: string = '';
  docName: string = 'Loading...';
  lastChange: (Date & Timestamp) | undefined;
  changeBy: string = '';
  currentUsername: string = '';

  constructor(
    private docService: DocService,
    private toastService: ToastService,
    private socketService: SocketService,
    private userService: UserService,
    private location: Location,
    private route: ActivatedRoute
  ) {
    this.userService.currentUserProfile.subscribe((currentUser) => {
      this.currentUsername = currentUser!.displayName ?? '';
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.docId = params['docId'];
      this.subscribeToDocData();
    });
  }

  ngOnDestroy(): void {
    if (this.docDataSubscription) {
      this.docDataSubscription.unsubscribe();
    }
  }

  subscribeToDocData() {
    if (this.docDataSubscription) {
      this.docDataSubscription.unsubscribe();
    }
    this.docDataSubscription = this.docService
      .getDocData(this.docId)
      .subscribe((doc) => {
        this.content = doc.content;
        this.docName = doc.docName;
        this.lastChange = doc.lastChange;
        this.changeBy = doc.changeBy;
      });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      this.toastService.showSaveSuccessModal();
      this.socketService.updateDoc(
        this.docId,
        this.content,
        this.currentUsername
      );
    }
  }

  goBack() {
    this.location.back();
  }

  onContentChanged(event: ContentChange) {
    this.content = event.html!;
  }

  onSelectionChanged(event: SelectionChange) {
    // console.log(event);
  }

  downloadDoc() {
    const preHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head>;
      <body>
      `;
    const html = preHtml + this.content + '</body></html>';
    const url =
      'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${this.docName}.doc`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
