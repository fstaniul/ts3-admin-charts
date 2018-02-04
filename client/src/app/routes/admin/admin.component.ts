import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  users: User[];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getUsers()
      .subscribe(data => this.users = data.users);
  }

  updateState(user: User, accept: boolean): void {
    if (accept) {
      const index = this.users.indexOf(user);
      const newState = Object.assign({}, user, {accepted: true});
      this.apiService.updateUser(newState)
        .subscribe(updated => this.users[index] = updated);
    } else {
      this.apiService.deleteUser(user)
        .subscribe(() => this.users.splice(this.users.indexOf(user), 1));
    }
  }

  toggleAdministratorState(user): void {
    const index = this.users.indexOf(user);
    const newState = Object.assign(user, {administrator: !user.administrator});
    this.apiService.updateUser(newState)
      .subscribe(updatedState => this.users[index] = updatedState);
  }
}
