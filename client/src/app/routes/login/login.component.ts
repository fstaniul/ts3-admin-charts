import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/of';

import { Token, User, AuthService } from './../../services/auth.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMsg = '';
  processing = false;

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.loginForm.disable();
    this.processing = true;
    this.errorMsg = undefined;

    const allwaysHandler = (() => {
      this.processing = false;
      this.loginForm.enable();
      this.loginForm.reset();
    }).bind(this);

    const successHandler = ((data) => {
      this.authService.login(data);
      allwaysHandler();
    }).bind(this);

    const errorHandler = ((err) => {
      allwaysHandler();
    }).bind(this);

    this.http.post<AuthPost>('/auth', this.loginForm.value)
      .subscribe(successHandler, errorHandler);
  }
}

interface AuthPost {
  token: Token;
  user: User;
}
