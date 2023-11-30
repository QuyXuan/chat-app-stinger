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

  showOfferCallVideo(hostName: string) {
    Swal.fire({
      title: `Let's call with ${hostName} ?`,
      text: 'Accept to join with us!',
      icon: 'question',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      showCancelButton: true,
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Your file has been deleted.',
          icon: 'success',
        });
      }
    });
  }
}
