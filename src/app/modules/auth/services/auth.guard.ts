import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    
    const currentUser = this.authService.currentUserValue;
    
    if (this.checkPermission()) {
      return true;
    } else {
      this.authService.logout();
      return false;
    }

  }

  private checkPermission(): boolean {
    return this.authService.getSession();
  }
}

