import { Component } from '@angular/core';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-chat-side',
  templateUrl: './chat-side.component.html',
  styleUrls: ['./chat-side.component.css'],
})
export class ChatSideComponent {
  faMagnifyingGlass = faMagnifyingGlass;
  constructor() {}
}
