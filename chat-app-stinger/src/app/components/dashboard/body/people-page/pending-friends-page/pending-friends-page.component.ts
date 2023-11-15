import { Component, OnInit } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { map } from 'rxjs';
import { PeopleService } from 'src/app/services/people/people.service';

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
    private toastService: NgToastService
  ) {}
  ngOnInit(): void {}

  acceptRequest(email: any) {
    this.peopleService.acceptRequest(email).subscribe((res) => {
      if (res) {
        this.toastService.success({
          detail: 'SUCCESS',
          summary: 'Friend request accepted successfully',
          duration: 5000,
        });
      } else {
        this.toastService.error({
          detail: 'ERROR',
          summary: 'Friend request accepted failed',
          duration: 5000,
        });
      }
    });
  }

  deleteRequest(email: any) {
    this.peopleService.deleteRequest(email).subscribe((res) => {
      if (res) {
        this.toastService.success({
          detail: 'SUCCESS',
          summary: 'Friend request deleted successfully',
          duration: 5000,
        });
      } else {
        this.toastService.error({
          detail: 'ERROR',
          summary: 'Friend request deleted failed',
          duration: 5000,
        });
      }
    });
  }
}
