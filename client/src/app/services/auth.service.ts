import { Router } from '@angular/router';
import { ApiService } from './../api.service';
import { UserData } from './auth.service';
import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService implements OnDestroy {
  private loggedInUser: User;
  private subject: BehaviorSubject<UserData>;

  constructor(private apiService: ApiService, private router: Router) {
    this.subject = new BehaviorSubject<UserData>(undefined);
    const token = localStorage.getItem('token');
    if (token) {
      this.apiService.validateToken(token)
        .subscribe(
        (data) => {
          this.loggedInUser = data.user;
          this.subject.next(data);
          localStorage.removeItem('token');
          localStorage.setItem('token', data.token);
        }, (data) => {
          localStorage.removeItem('token');
          this.loggedInUser = undefined;
          this.subject.next(undefined);
          this.router.navigate(['login']);
        });
    }
  }

  login(data: UserData) {
    localStorage.removeItem('token');
    localStorage.setItem('token', data.token);
    this.loggedInUser = data.user;
    this.subject.next(data);
  }

  logout() {
    localStorage.removeItem('token');
    this.loggedInUser = undefined;
    this.subject.next(undefined);
  }

  getToken(): string | undefined {
    return localStorage.getItem('token');
  }

  subscribeToData(): Observable<UserData> {
    return this.subject.asObservable();
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  getLoggedInUser(): User {
    return this.loggedInUser;
  }

  ngOnDestroy(): void {
    this.subject.complete();
  }
}

export interface IUser {
  uuid: string;
  username: string;
  updatedAt: Date;
  createdAt: Date;
  administrator: boolean;
  accepted: boolean;
}

export interface IUserData {
  token: Token;
  user: User;
}

export type User = IUser | undefined;
export type Token = string | undefined;
export type UserData = IUserData | undefined;
