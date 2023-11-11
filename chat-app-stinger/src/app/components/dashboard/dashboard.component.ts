import { Component, OnInit } from '@angular/core';
import { DataTransferService } from 'src/app/services/data-transfer/data.service';
import { SelectedItem } from 'src/app/services/data-transfer/selected-item';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  isSideNavCollapsed = false;
  screenWidth = 0;
  selectedNavLink: string = "Chats";

  constructor(private dataTransferService: DataTransferService) { }

  ngOnInit(): void {
    this.dataTransferService.selectedNavLink.subscribe((data: SelectedItem) => {
      // Vì có khả năng data được gửi đến là khi bấm vào mục people
      if (data.name !== '')
        this.selectedNavLink = data.name;
    });
  }

  onToggleSideNav(data: SideNavToggle) {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }

  onClickNavLink(selectedNavLink: string) {
    this.selectedNavLink = selectedNavLink;
  }
}