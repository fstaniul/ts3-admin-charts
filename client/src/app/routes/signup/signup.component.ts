import { Router } from '@angular/router';
import { ApiService } from './../../api.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { trigger, transition, query, state, animate, style } from '@angular/animations';

const alertAnimate = trigger('alert-animation', [
    state('true', style({ opacity: 1, height: '*', padding: '*', margin: '*'})),
    state('false', style({ opacity: 0, height: '0', padding: '0', margin: '0'})),
    transition('* => *', animate('400ms ease-in-out'))
]);

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  animations: [alertAnimate]
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  alert: SignupAlert;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.alert = {
      heading: '',
      message: '',
      display: false,
      error: false,
      classes: (() => this.alert.error ? 'alert-danger' : 'alert-success').bind(this),
      close: (() => this.alert.display = false).bind(this),
    };

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

  setClasses(controlName: string): { 'is-valid': boolean, 'is-invalid': boolean } {
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

    // console.log(this.signupForm.value);

    this.apiService.signup(this.signupForm.value)
      .subscribe(data => {
        this.alert.error = false;
        this.alert.heading = 'Udało się!';
        this.alert.message = `Twoje konto zostało utworzone. Teraz musisz tylko poczekać, aż administrator je zaakceptuje!`;
        this.alert.display = true;
      }, err => {
        console.log(err);
        this.alert.error = true;
        this.alert.heading = 'Ups! Coś poszło nie tak...';
        if (err.status === 409) {
          this.alert.message = 'Nie udało się utworzyć twojego konta ponieważ podany przez ciebie login jest już zajęty! ' +
            'Proszę wybierz inny login i spróbuj ponownie!';
        } else {
          this.alert.message = 'No nie złe chochliki znowu przegryzły kable na serwerze! A niech to! ' +
            'Niestety twoje konto nie może zostać utworzone w tym momencie :( Proszę spróbuj później.';
        }
        this.alert.display = true;
      });
  }

  ngOnInit() {
  }

}

interface SignupAlert {
  display: boolean;
  message: string;
  heading: string;
  error: boolean;
  classes: () => string;
  close: () => void;
}
