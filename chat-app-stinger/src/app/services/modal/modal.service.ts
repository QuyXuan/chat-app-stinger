import { Injectable } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  closeResult = '';

  constructor(private modalService: NgbModal) {}

  open(
    content: any,
    style?: {
      size?: 'sm' | 'lg' | 'xl';
    },
    backdrop: boolean = true,
    keyboard: boolean = true
  ) {
    return this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        size: style?.size || 'md',
        backdrop: backdrop ? true : 'static',
        keyboard: keyboard,
      })
      .result.then(
        (result) => {
          return (this.closeResult = `Close with: ${result}`);
        },
        (reason) => {
          return (this.closeResult = `Dismissed ${this.getDismissReason(
            reason
          )}`);
        }
      );
  }

  private getDismissReason(reason: any) {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
