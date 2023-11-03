import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent {
  constructor(private location: Location) { }

  ngOnInit() {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '750px';
  }

  goBack() {
    // Sử dụng lịch sử của trình duyệt để quay về lại trang trước đó
    this.location.back();
  }
}
