import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { SocketService } from '../socket-service/socket.service';
import { ChatService } from '../chat/chat.service';

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

  constructor(private chatService: ChatService) {}

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

  showWarningDeleteMessage(
    event: MouseEvent,
    chatId: string,
    messageId?: string
  ) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: true,
    });

    swalWithBootstrapButtons
      .fire({
        text: 'This message will be delete permanently, are you sure?',
        position: 'center',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Accept',
        cancelButtonText: 'Cancel',
      })
      .then((result) => {
        if (result.isConfirmed) {
          const button = event.target as HTMLElement;
          const deletedMessageElement =
            button
              .closest('.message-text-block')
              ?.querySelector('.chat-bubble .message-text') ?? undefined;
          if (deletedMessageElement) {
            deletedMessageElement.innerHTML = 'This message is deleted';
            deletedMessageElement
              .closest('.message-text-block')
              ?.classList.remove('edited');
            deletedMessageElement.parentElement?.classList.add('is-deleted');
            deletedMessageElement.nextElementSibling?.remove();
            deletedMessageElement.parentElement?.previousElementSibling?.remove();
          } else {
            // Rơi vào trường hợp xoá file, ảnh, audio
            const messageBlock = button
              .closest('.message-text-block')
              ?.querySelector('.chat-bubble');
            messageBlock?.previousElementSibling?.remove();
            messageBlock?.classList.add('is-deleted');
            messageBlock!.innerHTML = '';
            const newContent = document.createElement('p');
            newContent.style.marginBottom = '0';
            newContent.classList.add('message-text');
            newContent.innerHTML = 'This message is deleted';
            messageBlock?.appendChild(newContent);
          }
          this.chatService.deleteMessageSubject.next({ chatId, messageId });
        }
      });
  }

  showOfferCallVideo(hostName: string, onAccept: () => void) {
    Swal.fire({
      title: `Let's call with ${hostName} ?`,
      text: 'Accept to join with us!',
      icon: 'question',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Accept',
      showCancelButton: true,
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        onAccept();
      }
    });
  }
}
