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
}
