import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  faCloudDownloadAlt,
  faFile,
  faFileAudio,
  faFileCode,
  faFileExcel,
  faFileImage,
  faFilePdf,
  faFilePowerpoint,
  faFileText,
  faFileWord,
  faFileZipper,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent {
  @Input() index!: number;
  @Input() fileName!: string;
  @Input() fileNameURL!: string;
  @Output() removeFile = new EventEmitter<number>();

  faIcon = {
    faClose: faXmark,
    faFile: faFileText,
    faCloudDownloadAlt: faCloudDownloadAlt,
  };

  handleRemoveFile() {
    this.removeFile.emit(this.index);
  }

  downloadFile() {
    const downloadLink = document.createElement('a');
    downloadLink.href = this.fileNameURL;
    downloadLink.download = this.fileNameURL;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  getFileIcon() {
    if (this.fileName && this.fileName === '') {
      return faFile;
    }
    const fileExt = this.fileName.split('.').pop()?.toLocaleLowerCase();
    switch (fileExt) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
      case 'svg':
      case 'bmp':
      case 'tiff ':
        return faFileImage;
      case 'doc':
      case 'docx':
        return faFileWord;
      case 'pdf':
        return faFilePdf;
      case 'txt':
      case 'rtf':
      case 'odt':
        return faFileText;
      case 'xls':
      case 'xlsx':
      case 'ods':
        return faFileExcel;
      case 'ppt':
      case 'pptx':
      case 'odp':
        return faFilePowerpoint;
      case 'mp3':
      case 'mp4':
      case 'wav':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'ogg':
        return faFileAudio;
      case 'zip':
      case 'rar':
      case '7z':
        return faFileZipper;
      case 'html':
      case 'htm':
      case 'css':
      case 'js':
      case 'php':
      case 'java':
      case 'py':
      case 'c':
      case 'cpp':
      case 'dart':
      case 'cs':
      case 'json':
      case 'xml':
      case 'sql':
        return faFileCode;
      default:
        return faFile;
    }
  }
}
