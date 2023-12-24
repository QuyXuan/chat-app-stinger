import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SelectedItem } from './selected-item';

@Injectable({
  providedIn: 'root'
})
export class DataTransferService {
  private previousNavLinkIndex: number = 1;

  // Observables
  selectedNavLink = new Subject<SelectedItem>();
  displayName = new Subject<string>();
  newNotifications = new Subject<number>();

  updateSelectedNavLinkId(data: SelectedItem) {
    if (data.id == -1) {
      data.id = this.previousNavLinkIndex;
    } else if (data.id !== 2 && data.id !== 3) {
      this.previousNavLinkIndex = data.id;
    }
    this.selectedNavLink.next(data);
  }
}