import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { Socket } from 'ng-socket-io';

import { AuthService, User } from './../../services/auth.service';
import { ApiService } from '../../api.service';

import { style, trigger, keyframes, query, transition, animate } from '@angular/animations';

const badgeAnimation = trigger('badgeAnimation', [
  transition(':increment', [
    query('.unacceptedBadge', animate('1s ease-out', keyframes([
      style({transform: 'translateY(0)', offset: 0}),
      style({transform: 'translateY(-15px)', offset: .01}),
      style({transform: 'translateY(0)', offset: .2}),
      style({transform: 'translateY(-10px)', offset: .4}),
      style({transform: 'translateY(0)', offset: .6}),
      style({transform: 'translateY(-6px)', offset: .7}),
      style({transform: 'translateY(0)', offset: .8}),
      style({transform: 'translateY(-4px)', offset: .85}),
      style({transform: 'translateY(0)', offset: .9}),
      style({transform: 'translateY(-2px)', offset: .93}),
      style({transform: 'translateY(0)', offset: .96}),
      style({transform: 'translateY(-1px)', offset: .99}),
      style({transform: 'translateY(0)', offset: 1}),
    ])))
  ])
]);

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [badgeAnimation],
})
export class HeaderComponent implements OnInit, OnDestroy {
  loggedInUser: User;
  subsciptions: ISubscription[] = [];
  unacceptedUsersCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private io: Socket,
    private apiService: ApiService,
  ) {}

  callLogout(): void {
    console.log('calling logout!');
    this.authService.logout();
  }

  navigateToAdminPanel() {
    if (this.loggedInUser && this.loggedInUser.administrator) {
      this.router.navigate(['panel', 'admin']);
    }
  }

  badgeClass (): any {
    return this.unacceptedUsersCount > 0 ? 'badge-primary' : 'badge-light';
  }

  ngOnInit() {
    const s1 = this.authService.subscribeToData()
      .subscribe(data => {
        if (data) {
          this.loggedInUser = data.user;
        }
      });

    const s3 = this.apiService.getUnacceptedUsersCount()
      .subscribe(data => this.unacceptedUsersCount = data.count);

    const s2 = this.io.fromEvent<number>('users-accepted')
      .subscribe(count => this.unacceptedUsersCount = count);

    this.subsciptions.push(s1, s2);
  }

  ngOnDestroy() {
    this.subsciptions.forEach(s => s.unsubscribe());
  }
}

