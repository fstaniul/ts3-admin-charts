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
import { GraphsComponent } from './routes/graphs/graphs.component';
import { HeaderComponent } from './components/header/header.component';
import { LoadingComponent } from './components/loading/loading.component';
import { ApiService } from './api.service';
import { GraphComponent } from './components/graph/graph.component';

const appRoutes: Routes = [
  { path: 'graphs', component: GraphsComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent,
    GraphsComponent,
    HeaderComponent,
    LoadingComponent,
    GraphComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule.forRoot(),
  ],
  providers: [ApiService, AuthService, AuthHttpInterceptorProvider, JsonHttpInterceptorProvider],
  bootstrap: [AppComponent]
})
export class AppModule {}
