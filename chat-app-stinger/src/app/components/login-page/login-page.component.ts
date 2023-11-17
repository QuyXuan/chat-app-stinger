import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { constants } from 'src/app/constants';
import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { DataTransferService } from 'src/app/services/data-transfer/data.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent implements OnInit {
  type: string = 'password';
  eyeIcon: any = faEye;
  isText: boolean = false;
  loginForm!: FormGroup;
  resetPasswordEmail!: string;
  isValidEmail!: boolean;
  faIcon = { faEnvelope: faEnvelope, faLock: faLock };

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [Validators.required, Validators.pattern(constants.EMAIL_REGEX)],
      ],
      password: [
        '',
        [Validators.required, Validators.pattern(constants.PASSWORD_REGEX)],
      ],
    });
  }

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastService: NgToastService,
    private dataTransferService: DataTransferService
  ) { }

  passToggle() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = faEyeSlash) : (this.eyeIcon = faEye);
    this.isText ? (this.type = 'text') : (this.type = 'password');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(() => {
        this.authService.getCurrentUserProfile()
          .then((userProfile) => {
            if (userProfile !== null) {
              localStorage.setItem('displayName', userProfile.displayName ?? userProfile.uid);
              this.dataTransferService.displayName.next(userProfile.displayName ?? userProfile.uid);
            }
            this.router.navigate(['/dashboard']);
            this.toastService.success({
              detail: 'SUCCESS',
              summary: 'Login successfully',
              duration: 3000,
            });
          });
      });
    }
  }
}
