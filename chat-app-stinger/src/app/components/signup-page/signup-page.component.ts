import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import {
  faEnvelope,
  faEyeSlash,
  faLock,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { switchMap } from 'rxjs';
import { constants } from 'src/app/constants';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SocketService } from 'src/app/services/socket-service/socket.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css'],
})
export class SignupPageComponent implements OnInit {
  type: string = 'password';
  eyeIcon: any = faEye;
  isText: boolean = false;
  signupForm!: FormGroup;
  public resetPasswordEmail!: string;
  public isValidEmail!: boolean;
  faIcon = { faEnvelope: faEnvelope, faLock: faLock, faUser: faUser };

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      email: [
        '',
        [Validators.required, Validators.pattern(constants.EMAIL_REGEX)],
      ],
      password: [
        '',
        [Validators.required, Validators.pattern(constants.PASSWORD_REGEX)],
      ],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
        ],
      ],
    });
  }

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    private socketService: SocketService
  ) { }

  passToggle() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = faEyeSlash) : (this.eyeIcon = faEye);
    this.isText ? (this.type = 'text') : (this.type = 'password');
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const { email, password, username } = this.signupForm.value;
      this.authService
        .signUp(email, password)
        .pipe(
          switchMap(({ user: { uid } }) =>
            this.userService.addUser({
              uid,
              email,
              displayName: username,
              photoURL: constants.DEFAULT_AVATAR_URL,
            })
          )
        )
        .subscribe({
          next: (userCredential) => {
            this.router.navigate(['/dashboard']);
            this.socketService.sendIsLoggedIn();
            this.toastService.showSuccess('Signup successfully');
          },
          error: (error) => {
            this.toastService.showError('Signup failed');
          },
        });
    }
  }
}
