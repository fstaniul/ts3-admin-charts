import { UserData } from './auth.service';
import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService implements OnInit, OnDestroy {
  subject: BehaviorSubject<UserData>;

  constructor() {}

  login (data: UserData) {
    localStorage.setItem('token', data.token);
    this.subject.next(data);
  }

  logout () {
    localStorage.removeItem('token');
    this.subject.next(undefined);
  }

  getToken(): string|undefined {
    return localStorage.getItem('token');
  }

  getData(): Observable<UserData> {
    return this.subject.asObservable();
  }

  ngOnInit(): void {
    this.subject = new BehaviorSubject<UserData>(undefined);
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
}

export interface IUserData {
  token: Token;
  user: User;
}

export type User = IUser|undefined;
export type Token = string|undefined;
export type UserData = IUserData|undefined;
