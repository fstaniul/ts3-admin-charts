import { ApiService } from './../../api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/of';
import { Token, User, AuthService } from './../../services/auth.service';
import { Observable } from 'rxjs/Observable';
import { trigger, transition, query, state, animate, style } from '@angular/animations';


const alertAnimate = trigger('alert-animation', [
  state('true', style({ opacity: 1, height: '*', padding: '*', margin: '*'})),
  state('false', style({ opacity: 0, height: '0', padding: '0', margin: '0'})),
  transition('* => *', animate('400ms ease-in-out'))
]);

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [alertAnimate]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  processing = false;
  alert: any;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.alert = {
      display: false,
      close: (() => this.alert.display = false).bind(this),
    };
  }

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
      this.alert.display = true;
    }).bind(this);

    this.apiService.postAuth(this.loginForm.value)
      .subscribe(successHandler, errorHandler);
  }

  shouldShowError(controlName: string): boolean {
    const control = this.loginForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }
}

interface AuthPost {
  token: Token;
  user: User;
}
