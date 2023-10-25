import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import {
  faEnvelope,
  faEyeSlash,
  faLock,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { constants } from 'src/app/constants';
import { AuthService } from 'src/app/services/auth/auth.service';

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
    private formBuilder: FormBuilder
  ) {}

  passToggle() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = faEyeSlash) : (this.eyeIcon = faEye);
    this.isText ? (this.type = 'text') : (this.type = 'password');
  }

  onSubmit() {
    debugger;
    if (this.signupForm.valid) {
      this.authService.registerWithEmailAndPassword(
        this.signupForm.value.email,
        this.signupForm.value.password,
        this.signupForm.value.username
      );
    }
  }
}
