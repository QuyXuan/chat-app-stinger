import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { PeopleService } from 'src/app/services/people/people.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-pending-friends-page',
  templateUrl: './pending-friends-page.component.html',
  styleUrls: ['../people-page.component.css'],
  // styleUrls: ['./pending-friends-page.component.css'],
})
export class PendingFriendsPageComponent implements OnInit {
  allRequests = this.peopleService.pendingFriendsOfUser.pipe(
    map((users) => users)
  );

  constructor(
    private peopleService: PeopleService,
    private toastService: ToastService
  ) {}
  ngOnInit(): void {}

  acceptRequest(email: any) {
    this.peopleService.acceptRequest(email).subscribe((res) => {
      if (res) {
        this.toastService.showSuccess('Friend request accepted successfully');
      } else {
        this.toastService.showError('Friend request accepted failed');
      }
    });
  }

  deleteRequest(email: any) {
    this.peopleService.deleteRequest(email).subscribe((res) => {
      if (res) {
        this.toastService.showSuccess('Friend request deleted successfully');
      } else {
        this.toastService.showError('Friend request deleted failed');
      }
    });
  }
}
