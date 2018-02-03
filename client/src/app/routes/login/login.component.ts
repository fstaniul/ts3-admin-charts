import { ApiService } from './../../api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  processing = false;
  showErrorAlert = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['panel', 'graphs']);
    }
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).map(key => this.loginForm.controls[key]).forEach(control => control.markAsDirty());
      return;
    }

    this.loginForm.disable();
    this.processing = true;
    this.closeErrorAlert();

    const allwaysHandler = (() => {
      this.processing = false;
      this.loginForm.enable();
      this.loginForm.reset();
    }).bind(this);

    const successHandler = ((data) => {
      this.authService.login(data);
      this.router.navigate(['panel', 'graphs']);
      allwaysHandler();
    }).bind(this);

    const errorHandler = ((err) => {
      allwaysHandler();
      this.showErrorAlert = true;
    }).bind(this);

    this.apiService.postAuth(this.loginForm.value)
      .subscribe(successHandler, errorHandler);
  }

  shouldShowError(controlName: string): boolean {
    const control = this.loginForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  closeErrorAlert(): void {
    this.showErrorAlert = false;
  }
}

interface AuthPost {
  token: Token;
  user: User;
}
