import { LoggedInGuard } from './services/guards/logged-in.guard';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ApiService } from './api.service';
import { AuthService } from './services/auth.service';
import { AuthHttpInterceptorProvider } from './services/http-interceptors/auth.interceptor';
import { JsonHttpInterceptorProvider } from './services/http-interceptors/json.interceptor';

import { AppComponent } from './app.component';
import { LoginComponent } from './routes/login/login.component';
import { AdminComponent } from './routes/admin/admin.component';
import { GraphsComponent } from './routes/graphs/graphs.component';
import { HeaderComponent } from './components/header/header.component';
import { LoadingComponent } from './components/loading/loading.component';
import { SignupComponent } from './routes/signup/signup.component';
import { LoggedInAsAdminGuard } from './services/guards/logged-in-as-admin.guard';
import { ProfileComponent } from './routes/profile/profile.component';
import { PanelComponent } from './routes/panel/panel.component';
import { BackLinkComponent } from './components/back-link/back-link.component';

const appRoutes: Routes = [
  {
    path: 'panel', component: PanelComponent, canActivate: [LoggedInGuard], children: [
      { path: 'graphs', component: GraphsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'admin', component: AdminComponent, canActivate: [LoggedInAsAdminGuard] },
      { path: '', redirectTo: 'graphs', pathMatch: 'full'}
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', redirectTo: 'login' }
];

const socketIoConfig: SocketIoConfig = { url: 'localhost:3000', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent,
    GraphsComponent,
    HeaderComponent,
    LoadingComponent,
    SignupComponent,
    ProfileComponent,
    PanelComponent,
    BackLinkComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule.forRoot(),
    SocketIoModule.forRoot(socketIoConfig),
  ],
  providers: [ApiService, AuthService, AuthHttpInterceptorProvider, JsonHttpInterceptorProvider, LoggedInGuard, LoggedInAsAdminGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
