import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    
    if (this.checkPermission()) {
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      return true;
    }
  }
  private checkPermission(): boolean {
    return this.authService.getSession();
  }
}
