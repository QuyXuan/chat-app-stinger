import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-settings-item',
  templateUrl: './settings-item.component.html',
  styleUrls: ['./settings-item.component.css']
})
export class SettingsItemComponent implements OnInit {
  @Input() data!: { id: string; title: string; content: string; icon: string };
  @Output() itemSelected = new EventEmitter<string>();
  safeIcon!: SafeHtml;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.safeIcon = this.sanitizer.bypassSecurityTrustHtml(this.data.icon);
  }

  selectItem() {
    this.itemSelected.emit(this.data.id);
  }
}
