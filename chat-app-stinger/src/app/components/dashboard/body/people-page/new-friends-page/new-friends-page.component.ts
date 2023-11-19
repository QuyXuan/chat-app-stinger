import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, map, startWith } from 'rxjs';
import { PeopleService } from 'src/app/services/people/people.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-new-friends-page',
  templateUrl: './new-friends-page.component.html',
  styleUrls: ['../people-page.component.css'],
  // styleUrls: ['./new-friends-page.component.css'],
})
export class NewFriendsPageComponent implements OnInit {
  faIcon = {
    faMagnifyingGlass: faMagnifyingGlass,
  };
  searchControl = new FormControl('');
  myNewFriendsOfUser = combineLatest([
    this.peopleService.newFriendsOfUser,
    this.searchControl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([friends, searchString]) => {
      return friends.filter((friend) =>
        friend.displayName?.toLowerCase().includes(searchString!.toLowerCase())
      );
    })
  );
  ngOnInit(): void {}
  constructor(
    private peopleService: PeopleService,
    private toastService: ToastService
  ) {}

  addFriend(receiver: string) {
    this.peopleService.sendFriendRequest(receiver).subscribe((res) => {
      if (res) {
        this.toastService.showSuccess('Friend request sent');
      } else {
        this.toastService.showError('Friend request sent');
      }
    });
  }
}
