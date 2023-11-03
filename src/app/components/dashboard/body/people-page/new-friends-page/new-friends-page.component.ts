import { Component, OnInit } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { PeopleService } from 'src/app/services/people/people.service';

@Component({
  selector: 'app-new-friends-page',
  templateUrl: './new-friends-page.component.html',
  styleUrls: ['../people-page.component.css'],
  // styleUrls: ['./new-friends-page.component.css'],
})
export class NewFriendsPageComponent implements OnInit {
  allNewFriendsOfUser: any;

  ngOnInit(): void {
    this.peopleService.getAllUsers().subscribe(() => {
      debugger;
      this.peopleService.getNewFriendsOfUser().then((users) => {
        this.allNewFriendsOfUser = users;
      });
    });
  }

  constructor(
    private peopleService: PeopleService,
    private toastService: NgToastService
  ) {}

  addFriend(receiver: string) {
    this.peopleService.sendFriendRequest(receiver).then(() => {
      this.toastService.success({
        detail: 'ERROR',
        summary: 'Friend request sent',
        duration: 5000,
      });
    });
  }
}
