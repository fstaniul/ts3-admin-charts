import { Router } from '@angular/router';
import { ApiService } from './../../api.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  displayError = true;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      passwordRepeat: ['', [Validators.required, this.sameAsPassword.bind(this)]],
    });
  }

  sameAsPassword(control: FormControl) {
    if (this.signupForm && this.signupForm.controls) {
      return this.signupForm.controls.password.value === control.value ? null : {
        passwordRepeat: {
          valid: false,
        }
      };
    }

    return true;
  }

  setClasses(controlName: string): {'is-valid': boolean, 'is-invalid': boolean} {
    const control = this.signupForm.controls[controlName];
    return {
      'is-invalid': control.invalid && (control.touched || control.dirty),
      'is-valid': control.valid && (control.touched || control.dirty)
    };
  }

  shouldShowError(controlName: string): boolean {
    const control = this.signupForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls).map(key => this.signupForm.controls[key]).forEach(control => control.markAsDirty());
      return;
    }

    console.log(this.signupForm.value);

    this.apiService.signup(this.signupForm.value)
      .subscribe(data => this.router.navigate(['login']), err => this.displayError = true);
  }

  ngOnInit() {
  }

}
