import { Component, OnInit } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { PeopleService } from 'src/app/services/people/people.service';

@Component({
  selector: 'app-people-page',
  templateUrl: './people-page.component.html',
  styleUrls: ['./people-page.component.css'],
})
export class PeoplePageComponent implements OnInit {
  allFriendsOfUser: any;

  constructor(
    private peopleService: PeopleService,
    private toastService: NgToastService
  ) {}

  ngOnInit(): void {
    this.peopleService.getAllUsers().subscribe(() => {
      this.peopleService.getFriendsOfUser().then((users) => {
        this.allFriendsOfUser = users;
      });
    });
  }

  acceptRequest(request: any) {
    this.peopleService.acceptMyRequest(request.sender).then(() => {
      this.toastService.success({
        detail: 'SUCCESS',
        summary: 'Friend request accepted',
        duration: 5000,
      });
    });
  }

  deleteRequest(request: any) {
    this.peopleService.deleteRequest(request.sender).then(() => {
      this.toastService.success({
        detail: 'SUCCESS',
        summary: 'Friend request deleted',
        duration: 5000,
      });
    });
  }
}
