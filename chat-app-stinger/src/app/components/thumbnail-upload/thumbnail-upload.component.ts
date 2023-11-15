import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-thumbnail-upload',
  templateUrl: './thumbnail-upload.component.html',
  styleUrls: ['./thumbnail-upload.component.css']
})
export class ThumbnailUploadComponent {
  @Input() index!: number;
  @Input() image: any;
  @Output() removeImage = new EventEmitter<number>;

  faIcon = {
    faClose: faXmark
  }

  handleRemoveImage() {
    this.removeImage.emit(this.index);
  }
}
