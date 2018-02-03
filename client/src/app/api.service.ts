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

  getReg(id: number, from: Date, to: Date): Observable<RegResponse> {
    // return this.http.get<RegResponse>(`/api/reg/${id}`, {params: {from: from.toISOString(), to: to.toISOString()}});

    return Observable.of({registeredClients: [
      {databaseId: 1, registrationDate: new Date('2018-01-31T10:00:04.000+01:00')},
      {databaseId: 4, registrationDate: new Date('2018-01-30T10:20:04.000+01:00')},
      {databaseId: 3, registrationDate: new Date('2018-01-31T10:00:04.000+01:00')},
      {databaseId: 5, registrationDate: new Date('2018-01-31T10:20:04.000+01:00')},
      {databaseId: 2, registrationDate: new Date('2018-01-31T10:00:04.000+01:00')},
    ]});
  }
}

export interface ClientData {
  databaseId: number;
  registrationDate: Date;
}

export interface RegResponse {
  registeredClients: ClientData[];
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