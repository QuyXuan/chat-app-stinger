import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from 'src/app/services/auth/auth.service';
import ValidateForm from 'src/app/helpers/validate-form';
import { constants } from 'src/app/constants';
import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
} from '@fortawesome/free-solid-svg-icons';

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
  public resetPasswordEmail!: string;
  public isValidEmail!: boolean;
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
    private formBuilder: FormBuilder
  ) {}

  passToggle() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = faEyeSlash) : (this.eyeIcon = faEye);
    this.isText ? (this.type = 'text') : (this.type = 'password');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.signInWithEmailAndPassword(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
    }
  }
}
