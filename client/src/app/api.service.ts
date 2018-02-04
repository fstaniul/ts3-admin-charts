import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { User, Token, UserData, AuthService } from './services/auth.service';
import { Injectable } from '@angular/core';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/do';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { OnDestroy } from '@angular/core';

/*
@Injectable()
export class ApiService {
  constructor(private http: HttpClient) { }

  postAuth(data: AuthRequest): Observable<AuthResponse> {
    // return this.http.post<AuthResponse>('/auth', data);

    if (data.password !== 'haslo') {
      return Observable.throw(new Error('Invalid password!')).delay(1000);
    }

    return Observable.of({
      token: 'super-secret-token',
      user: {
        uuid: 'super-long-uuid',
        username: 'Filipo',
        createdAt: new Date(),
        updatedAt: new Date(),
        administrator: true,
        accepted: true,
      }
    }).delay(500);
  }

  getTs3Admins(): Observable<TS3AdminsResponse> {
    // return this.http.get<TS3Administrator>('/api/ts3admins');

    return Observable.of({
      administrators: [
        { nickname: 'Filipo', databaseId: 5, uniqueId: 'filipo-unique' },
        { nickname: 'Parwati', databaseId: 6, uniqueId: 'parwati-unique' }
      ]
    }).delay(1500);
  }

  parseDateObject(date: DateObject) {
    const month = date.month < 10 ? '0' + date.month : date.month;
    const day = date.day < 10 ? '0' + date.day : date.day;
    return `${date.year}-${month}-${day}`;
  }

  getReg(data: RegRequest): Observable<RegData> {
    const id = data.ids.join('+');
    const from = this.parseDateObject(data.from);
    const to = this.parseDateObject(data.to);
    // return this.http.get<RegData>(`/api/reg`, {params: {ids, from, to}});

    return Observable.of({
      labels: ['2018-01-26', '2018-01-27', '2018-01-28', '2018-01-29', '2018-01-30'],
      data: [
        { label: 'Zarejestrowani przez filipo!', count: [1, 3, 7, 4, 3, 6] },
        { label: 'Zarejestrowani przez parwacia!', count: [3, 4, 9, 12, 4] },
        { label: 'Zarejestrowani przez kropaik!', count: [3, 12, 5, 6, 3] },
        { label: 'Zarejestrowani przez xd!', count: [3, 3, 4, 1, 4] },
        { label: 'Zarejestrowani przez virus!', count: [3, 22, 0, 12, 7] },
        { label: 'Zarejestrowani przez cos!', count: [3, 17, 10, 2, 4] },
      ]
    }).delay(1000);
  }

  validateToken(token): Observable<AuthResponse> {
    // return this.http.get<UserData>('/validate');

    return Observable.of({
      token: 'super-secret-token',
      user: {
        uuid: 'super-long-uuid',
        username: 'Filipo',
        createdAt: new Date(),
        updatedAt: new Date(),
        administrator: true,
        accepted: true,
      }
    }).delay(500);
  }

  signup(data: SignupRequest): Observable<any> {
    // return this.http.post<any>('/users', data);

    return Observable.of({ success: true }).delay(1500);
  }

  getUsers(): Observable<UsersResponse> {
    // return this.http.get<UsersResponse>('/api/users');

    return Observable.of({
      users: [
        { uuid: 'super-uuid', username: 'Filipo', administrator: true, accepted: true, createdAt: new Date(), updatedAt: new Date() },
        { uuid: 'super-uuid', username: 'Damian', administrator: false, accepted: true, createdAt: new Date(), updatedAt: new Date() },
        { uuid: 'super-uuid', username: 'Kropiak', administrator: false, accepted: true, createdAt: new Date(), updatedAt: new Date() },
        { uuid: 'super-uuid', username: 'Patryczek', administrator: false, accepted: false, createdAt: new Date(), updatedAt: new Date() },
        { uuid: 'super-uuid', username: 'Super', administrator: false, accepted: false, createdAt: new Date(), updatedAt: new Date() },
      ]
    });
  }

  updateUser (user): Observable<User> {
    // return this.http.patch<User>('/api/users', user);

    return Observable.of(user).delay(1000);
  }

  deleteUser (user): Observable<SuccessMessage> {
    // return this.http.delete(`/users/${user.uuid}`);

    return Observable.of({success: true}).delay(1000);
  }

  changePassword(uuid: string, requestData: {password: string, passwordRepeat: string}): Observable<UserData> {

    return Observable.of({
      token: 'super-tajny-token',
      user: { uuid: 'super-uuid', username: 'Filipo', administrator: true, accepted: true, createdAt: new Date(), updatedAt: new Date() },
    })
    .delay(1000);
  }
}
*/

@Injectable()
export class ApiService implements OnDestroy {
  private subject: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) {
    this.subject = new BehaviorSubject<boolean>(false);
  }

  ngOnDestroy() {
    this.subject.complete();
  }

  postAuth(data: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth', data);
  }

  getTs3Admins(): Observable<TS3AdminsResponse> {
    return this.http.get<TS3AdminsResponse>('/api/ts3admins');
  }

  parseDateObject(date: DateObject) {
    const month = date.month < 10 ? '0' + date.month : date.month;
    const day = date.day < 10 ? '0' + date.day : date.day;
    return `${date.year}-${month}-${day}`;
  }

  getReg(data: RegRequest): Observable<RegData> {
    const ids = data.ids.join('+');
    const from = this.parseDateObject(data.from);
    const to = this.parseDateObject(data.to);
    return this.http.get<RegData>(`/api/reg`, { params: { ids, from, to } });
  }

  validateToken(token): Observable<AuthResponse> {
    this.subject.next(true);
    return this.subject.debounceTime(300).flatMap((bool) => this.http.get<UserData>('/validate'));
  }

  signup(data: SignupRequest): Observable<any> {
    return this.http.post<any>('/api/users', data);
  }

  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>('/api/users');
  }

  updateUser(user): Observable<User> {
    return this.http.patch<User>('/api/users', user);
  }

  deleteUser(user): Observable<SuccessMessage> {
    return this.http.delete<SuccessMessage>(`/api/users/${user.uuid}`);
  }

  changePassword(uuid: string, requestData: { password: string, passwordRepeat: string }): Observable<UserData> {
    return this.http.patch<UserData>(`/api/users/${uuid}`, requestData);
  }

  getUnacceptedUsersCount(): Observable<UnacceptedUsersCountResponse> {
    return this.http.get<UnacceptedUsersCountResponse>('/api/unaccepted-users');
  }
}


export interface UnacceptedUsersCountResponse {
  count: number;
}

export interface SuccessMessage {
  success: boolean;
}

export interface UsersResponse {
  users: User[];
}

export interface SignupRequest {
  username: string;
  password: string;
  passwordRepeat: string;
}

export interface RegData {
  labels: string[];
  data: {
    label: string;
    count: number[];
  }[];
}

export interface DateObject {
  year: number;
  month: number;
  day: number;
}

export interface RegRequest {
  ids: number[];
  from: DateObject;
  to: DateObject;
}

export interface TS3Administrator {
  nickname: string;
  databaseId: number;
}

export interface TS3AdminsResponse {
  administrators: TS3Administrator[];
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: Token;
  user: User;
}
