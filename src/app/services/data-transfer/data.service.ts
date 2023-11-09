import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SelectedItem } from './selected-item';

@Injectable({
  providedIn: 'root'
})
export class DataTransferService {
  selectedNavLink = new Subject<SelectedItem>();

  updateSelectedNavLinkId(data: SelectedItem) {
    this.selectedNavLink.next(data);
  }
}