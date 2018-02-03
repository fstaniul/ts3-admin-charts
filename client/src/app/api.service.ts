import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { User, Token } from './services/auth.service';
import { Injectable } from '@angular/core';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';

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

  parseDateObject (date: DateObject) {
    const month = date.month < 10 ? '0' + date.month : date.month;
    const day = date.day < 10 ? '0' + date.day : date.day;
    return `${date.year}-${month}-${day}`;
  }

  getReg(data: RegRequest): Observable<RegData> {
    const id = data.ids.join('+');
    const from = this.parseDateObject(data.from);
    const to = this.parseDateObject(data.to);
    // return this.http.get<RegData>(`/api/reg`, {params: {ids, from, to}});

    console.log(data);

    return Observable.of({
      labels: ['2018-01-26', '2018-01-27', '2018-01-28', '2018-01-29', '2018-01-30'],
      data: [
        {label: 'Zarejestrowani przez filipo!', count: [1, 3, 7, 4, 3, 6]},
        {label: 'Zarejestrowani przez parwacia!', count: [3, 4, 9, 12, 4]},
        {label: 'Zarejestrowani przez kropaik!', count: [3, 12, 5, 6, 3]},
        {label: 'Zarejestrowani przez xd!', count: [3, 3, 4, 1, 4]},
        {label: 'Zarejestrowani przez virus!', count: [3, 22, 0, 12, 7]},
        {label: 'Zarejestrowani przez cos!', count: [3, 17, 10, 2, 4]},
      ]
    }).delay(1000);
  }

  validateToken(token): Observable<AuthResponse> {
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

    return Observable.of({success: true}).delay(1500);
  }
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
  uniqueId: string;
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
