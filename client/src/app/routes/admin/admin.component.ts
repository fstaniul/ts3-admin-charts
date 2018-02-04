import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../api.service';
import { User } from '../../services/auth.service';
import { Socket } from 'ng-socket-io';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  users: User[];
  private subscriptions: ISubscription[] = [];

  constructor(
    private apiService: ApiService,
    private socket: Socket,
  ) {}

  ngOnInit() {
    this.reloadData();
    this.setupSocket();
  }

  reloadData() {
    this.apiService.getUsers()
      .subscribe(data => this.users = data.users);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  updateState(user: User, accept: boolean): void {
    if (accept) {
      const newState = Object.assign({}, user, {accepted: true});
      this.apiService.updateUser(newState)
        .subscribe(() => {});
    } else {
      this.apiService.deleteUser(user)
        .subscribe(() => {});
    }
  }

  toggleAdministratorState(user): void {
    const index = this.users.indexOf(user);
    const newState = Object.assign({}, user, {administrator: !user.administrator});
    this.apiService.updateUser(newState)
      .subscribe(() => {});
  }

  setupSocket(): void {
    const s1 = this.socket.fromEvent<User>('users-new').subscribe(user => this.users.push(user));
    const s2 = this.socket.fromEvent<User>('users-updated').subscribe(user => {
      const index = this.users.findIndex((u) => u.uuid === user.uuid);
      this.users[index] = user;
    });
    const s3 = this.socket.fromEvent<{uuid: string}>('users-deleted').subscribe(info => {
      const index = this.users.findIndex(user => user.uuid === info.uuid);
      this.users.splice(index, 1);
    });

    this.subscriptions.push(s1, s2, s3);
  }
}
