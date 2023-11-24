import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faClose, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { constants } from 'src/app/constants';
import { Utils } from 'src/app/helpers/utils';
import { DataTransferService } from 'src/app/services/data-transfer/data.service';
import { SelectedItem } from 'src/app/services/data-transfer/selected-item';
import { NotificationData } from 'src/app/services/notification/notification-data';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.css']
})
export class NotificationPageComponent implements OnInit {
  notifications!: NotificationData[];
  @Output() onBtnCloseClick = new EventEmitter<{ id: number, name: string }>();

  faIcon = {
    faUser: faUser,
    faUsers: faUsers,
    faClose: faClose
  }

  constructor(private dataTransferService: DataTransferService,
    private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationService.getNotifications()
      .then((notifications) => {
        console.log(notifications);
        this.notifications = notifications;
        if (this.notifications.length > 0) {
          // Có thể sau này phát triển hiển thị số notification chưa xem
          const newNotificationsCount = this.notifications.reduce((count: number, notification) => {
            return count + (notification.isSeen ? 0 : 1);
          }, 0);
          this.dataTransferService.newNotifications.next(newNotificationsCount);
        }
      });

    this.dataTransferService.selectedNavLink.subscribe((navLink: SelectedItem) => {
      if (navLink.name === 'Notifications') {
        this.calculateTimeOfNotificationAgain();
      }
    })
  }

  handleBtnCloseClick() {
    this.dataTransferService.updateSelectedNavLinkId(new SelectedItem(constants.PREVIOUS_NAV_LINK_ID, 'Chats'));
  }

  calculateTimeOfNotificationAgain() {
    // Lần đầu tiên vào component này thì this.notifications = undefined nên mới dùng ?
    this.notifications?.forEach((notification) => {
      notification.receiveAt = Utils.calculateBetweenTwoTime(notification.receiveAtSaveInDB);
    })
  }
}