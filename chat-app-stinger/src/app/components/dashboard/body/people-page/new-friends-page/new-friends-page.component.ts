import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { ProfileUser } from 'src/app/models/profile-user';
import { PeopleService } from 'src/app/services/people/people.service';
import { SocketService } from 'src/app/services/socket-service/socket.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-new-friends-page',
  templateUrl: './new-friends-page.component.html',
  styleUrls: ['../people-page.component.css'],
  // styleUrls: ['./new-friends-page.component.css'],
})
export class NewFriendsPageComponent {
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

  constructor(
    private peopleService: PeopleService,
    private toastService: ToastService,
    private socketService: SocketService
  ) { }

  addFriend(receiver: string) {
    this.peopleService.sendFriendRequest(receiver).subscribe((res) => {
      if (res) {
        this.updateUINewFriends(receiver);
        this.toastService.showSuccess('Friend request sent');
        this.socketService.sendRequestAddAcceptNewFriend(receiver, 'addNewFriend');
      } else {
        this.toastService.showError('Friend request sent');
      }
    });
  }

  updateUINewFriends(receiver: string) {
    this.myNewFriendsOfUser.subscribe(currentNewFriends => {
      currentNewFriends = currentNewFriends.filter(newFriend => newFriend.email != receiver);
      this.myNewFriendsOfUser = new Observable<ProfileUser[]>(observer => {
        observer.next([...currentNewFriends]);
      });
    })
  }
}
