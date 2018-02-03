import { AuthService, User } from './../../services/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  loggedInUser: User;
  subsciption: ISubscription;

  constructor(private authService: AuthService) { }

  callLogout(): void {
    console.log('calling logout!');
    this.authService.logout();
  }

  ngOnInit() {
    this.subsciption = this.authService.getData()
      .subscribe(data => this.loggedInUser = data.user);
  }

  ngOnDestroy() {
    if (this.subsciption) {
      this.subsciption.unsubscribe();
    }
  }

}
