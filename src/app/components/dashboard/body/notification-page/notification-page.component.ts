import { Component, EventEmitter, Output } from '@angular/core';
import { faClose, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { DataTransferService } from 'src/app/services/data-transfer/data.service';
import { SelectedItem } from 'src/app/services/data-transfer/selected-item';

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.css']
})
export class NotificationPageComponent {
  @Output() onBtnCloseClick = new EventEmitter<{ id: number, name: string }>();

  faIcon = {
    faUser: faUser,
    faUsers: faUsers,
    faClose: faClose
  }

  constructor(private dataTransferService: DataTransferService) { }

  handleBtnCloseClick() {
    this.dataTransferService.updateSelectedNavLinkId(new SelectedItem(1, 'Chats'));
  }
}