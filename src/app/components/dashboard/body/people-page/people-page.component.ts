import { Component, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, map, startWith } from 'rxjs';
import { ProfileUser } from 'src/app/models/profile-user';
import { ChatService } from 'src/app/services/chat/chat.service';
import { PeopleService } from 'src/app/services/people/people.service';

@Component({
  selector: 'app-people-page',
  templateUrl: './people-page.component.html',
  styleUrls: ['./people-page.component.css'],
})
export class PeoplePageComponent implements OnInit {
  faIcon = {
    faMagnifyingGlass: faMagnifyingGlass,
  };
  searchControl = new FormControl('');
  myFriends = combineLatest([
    this.peopleService.friendsOfUser,
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
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  createChat(friend: ProfileUser) {
    this.chatService.createChat(friend).subscribe((chatId) => {
      this.router.navigate(['/dashboard', { outlets: { body: ['chat'] } }], {
        state: { chatId: chatId },
      });
    });
  }
}
