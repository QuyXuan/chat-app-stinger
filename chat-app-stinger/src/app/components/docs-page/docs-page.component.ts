import { Component } from '@angular/core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ContentChange, SelectionChange } from 'ngx-quill';
import { Location } from '@angular/common';
import { DocService } from 'src/app/services/doc-service/doc.service';

@Component({
  selector: 'app-docs-page',
  templateUrl: './docs-page.component.html',
  styleUrls: ['./docs-page.component.css'],
})
export class DocsPageComponent {
  faIcon = {
    faArrowLeft: faArrowLeft,
    faIconSize: 50,
  };

  content: string = '';
  docName: string = 'MIKE';

  constructor(private docService: DocService, private location: Location) {}

  goBack() {
    this.location.back();
  }

  onContentChanged(event: ContentChange) {
    console.log(event);
  }

  onSelectionChanged(event: SelectionChange) {
    console.log(event);
  }
}
