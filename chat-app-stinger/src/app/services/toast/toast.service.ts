import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  constructor() {}

  showSuccess(message: string) {
    this.toast.fire({
      icon: 'success',
      title: message,
    });
  }

  showError(message: string) {
    this.toast.fire({
      icon: 'error',
      title: message,
    });
  }

  showWarning(message: string) {
    this.toast.fire({
      icon: 'warning',
      title: message,
    });
  }

  showImageModal(imageURL: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: true,
    });
    swalWithBootstrapButtons
      .fire({
        imageUrl: imageURL,
        imageAlt: 'Image',
        showCancelButton: true,
        confirmButtonText: 'Download Image',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          const downloadLink = document.createElement('a');
          downloadLink.href = imageURL;
          downloadLink.download = 'image';
          downloadLink.style.display = 'none';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      });
  }

  showSaveSuccessModal() {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Your work has been saved',
      showConfirmButton: false,
      timer: 1000,
    });
  }
}
