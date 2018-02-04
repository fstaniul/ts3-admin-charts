import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../api.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ISubscription } from 'rxjs/Subscription';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  loggedInUser: User;
  passwordForm: FormGroup;
  dataSubscription: ISubscription;
  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.passwordForm = this.formBuilder.group({
      password: ['', Validators.required],
      passwordRepeat: ['', [Validators.required, this.checkIfPasswordsMatch.bind(this)]]
    });
  }

  checkIfPasswordsMatch (control: FormControl) {
    if (this.passwordForm && this.passwordForm.controls.password.value === control.value) {
      return null;
    }

    return {passwordMissmatch: true};
  }

  getErrorClasses(controlName: string) {
    return {
      'is-invalid': this.shouldShowError(controlName)
    };
  }

  shouldShowError(controlName: string) {
    const control = this.passwordForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      Object.values(this.passwordForm.controls).forEach(control => control.markAsDirty());
      return;
    }

    this.apiService.changePassword(this.loggedInUser.uuid, this.passwordForm.value)
      .subscribe(data => {
        this.authService.logout();
        this.router.navigate(['login']);
      });

    this.passwordForm.reset();
  }

  ngOnInit() {
    this.dataSubscription = this.authService.subscribeToData()
      .subscribe(data => data && (this.loggedInUser = data.user));
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}
