import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SelectedItem } from './selected-item';

@Injectable({
  providedIn: 'root'
})
export class DataTransferService {
  private previousNavLinkIndex: number = 1;
  selectedNavLink = new Subject<SelectedItem>();

  updateSelectedNavLinkId(data: SelectedItem) {
    if (data.id == -1) {
      data.id = this.previousNavLinkIndex;
    } else if (data.id !== 2 && data.id !== 3) {
      this.previousNavLinkIndex = data.id;
    }
    this.selectedNavLink.next(data);
  }
}