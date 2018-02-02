import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from './services/auth.service';
import { AuthHttpInterceptorProvider } from './services/http-interceptors/auth.interceptor';
import { JsonHttpInterceptorProvider } from './services/http-interceptors/json.interceptor';

import { AppComponent } from './app.component';
import { LoginComponent } from './routes/login/login.component';
import { AdminComponent } from './routes/admin/admin.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule.forRoot(),
  ],
  providers: [AuthService, AuthHttpInterceptorProvider, JsonHttpInterceptorProvider],
  bootstrap: [AppComponent]
})
export class AppModule {}
