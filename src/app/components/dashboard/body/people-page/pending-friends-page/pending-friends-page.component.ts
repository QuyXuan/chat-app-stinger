import { Component, OnInit } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { PeopleService } from 'src/app/services/people/people.service';

@Component({
  selector: 'app-pending-friends-page',
  templateUrl: './pending-friends-page.component.html',
  styleUrls: ['../people-page.component.css'],
  // styleUrls: ['./pending-friends-page.component.css'],
})
export class PendingFriendsPageComponent implements OnInit {
  allRequests: any;

  constructor(
    private peopleService: PeopleService,
    private toastService: NgToastService
  ) {}

  ngOnInit(): void {
    this.peopleService.getAllUsers().subscribe(() => {
      this.peopleService.getMyRequests().subscribe((requests) => {
        this.allRequests = this.peopleService.getUsers(
          requests.map((request: any) => request.receiver)
        );
      });
    });
  }

  acceptRequest(email: string) {
    this.peopleService.acceptMyRequest(email).then(() => {
      this.toastService.success({
        detail: 'SUCCESS',
        summary: 'Friend request accepted',
        duration: 5000,
      });
    });
  }

  deleteRequest(email: string) {
    this.peopleService.deleteRequest(email).then(() => {
      this.toastService.success({
        detail: 'SUCCESS',
        summary: 'Friend request deleted',
        duration: 5000,
      });
    });
  }
}
