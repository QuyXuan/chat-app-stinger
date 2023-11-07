import { Component, OnInit } from '@angular/core'
import { NgToastService } from 'ng-angular-popup'
import { DataTransferService } from 'src/app/services/data-transfer/data.service'
import { SelectedItem } from 'src/app/services/data-transfer/selected-item'
import { SettingsService } from 'src/app/services/settings/settings.service'

@Component({
    selector: 'app-settings-page',
    templateUrl: './settings-page.component.html',
    styleUrls: ['./settings-page.component.css'],
})
export class SettingsPageComponent implements OnInit {
    items = [
        {
            id: 'Name',
            title: 'Anil',
            content: 'Đà Nẵng',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit" _ngcontent-serverapp-c3169809307="">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              `,
        },
        {
            id: 'Account',
            title: 'Account',
            content: 'Update Your Account Details',
            icon: `<svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-chevron-right"
              _ngcontent-serverapp-c3248290250=""
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>`,
        },
        {
            id: 'Chat',
            title: 'Chat',
            content: 'Control Your Chat Backup',
            icon: `<svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-chevron-right"
              _ngcontent-serverapp-c3248290250=""
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>`,
        },
        {
            id: 'Intelligent',
            title: 'Intelligent',
            content: 'Sync Your Other Social Account',
            icon: `<svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-chevron-right"
              _ngcontent-serverapp-c3248290250=""
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>`,
        },
        {
            id: 'Help',
            title: 'Help',
            content: 'You are Confusion, Tell me',
            icon: `<svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-chevron-right"
              _ngcontent-serverapp-c3248290250=""
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>`,
        },
    ]

    currentUser: any
    name = 'Initial Value'

    constructor(
        private settingsService: SettingsService,
        private toastService: NgToastService,
        private dataTransferService: DataTransferService
    ) {}

    ngOnInit(): void {
        // this.settingsService.getCurrentUser().subscribe((user) => {
        //   this.currentUser =
        //   {
        //     displayName: user?.displayName,
        //     email: user?.email,
        //   };
        // });
        this.settingsService.getCurrentUser().subscribe((user: any) => {
            if (user && user.length > 0) {
                this.currentUser = {
                    displayName: user[0].displayName,
                    email: user[0].email,
                    address: user[0].address,
                }
            }
        })
    }

    onSubmitForm() {
        const data = {
            displayName: this.currentUser.displayName,
            email: this.currentUser.email,
            address: this.currentUser.address,
            // Thêm các trường dữ liệu khác cần cập nhật
        }

        this.settingsService
            .updateUserInfo(data)
            .then(() => {
                //this.toastService.success('User information updated successfully');
                this.toastService.success({
                    detail: 'SUCCESS',
                    summary: 'User information updated successfully',
                    duration: 5000,
                })
            })
            .catch((error) => {
                // this.toastService.error('Failed to update user information: ' + error);
                this.toastService.success({
                    detail: 'ERROR',
                    summary: 'Failed to update user information: ' + error,
                    duration: 5000,
                })
            })
    }

    selectedItemContent: string = ''
    onItemSelected(content: string) {
        this.selectedItemContent = content
    }
    goBackSettings() {
        this.selectedItemContent = ''
    }

    handleBtnCloseClick() {
        this.dataTransferService.updateSelectedNavLinkId(
            new SelectedItem(1, 'Chats')
        )
    }
}