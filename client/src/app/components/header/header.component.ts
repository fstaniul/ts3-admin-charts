import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { AuthService, User } from './../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  loggedInUser: User;
  subsciption: ISubscription;

  constructor(
    private authService: AuthService,
    private router: Router
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

  ngOnInit() {
    this.subsciption = this.authService.subscribeToData()
      .subscribe(data => {
        if (data) {
          this.loggedInUser = data.user;
        }
      });
  }

  ngOnDestroy() {
    if (this.subsciption) {
      this.subsciption.unsubscribe();
    }
  }

}
