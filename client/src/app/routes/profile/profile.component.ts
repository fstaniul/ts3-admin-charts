import { User, AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  loggedInUser: User;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.subscribeToData()
      .subscribe(data => this.loggedInUser = data ? data.user : undefined);
  }

}
