import { AuthService } from './../auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LoggedInAsAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isLoggedIn()) {
      if (this.authService.getLoggedInUser() && this.authService.getLoggedInUser().administrator) {
        return true;
      } else {
        this.router.navigate(['/profile']);
        return false;
      }
    }

    this.router.navigate(['/login']);

    return false;
  }
}
