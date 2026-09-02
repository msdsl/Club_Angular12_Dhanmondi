import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  @Input() appHeaderDefaulMenuDisplay: boolean;
  @Input() isRtl: boolean;

  itemClass: string = 'ms-1 ms-lg-3';
  btnClass: string = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
  userAvatarClass: string = 'symbol-35px symbol-md-40px';
  btnIconClass: string = 'fs-2 fs-md-1';
  user: any;

  constructor() {}

  ngOnInit(): void {
    const stored = localStorage.getItem('currentBgclUser');
    if (stored) {
      try {
        this.user = JSON.parse(stored);
      } catch (e) {
        this.user = null;
      }
    }
  }

  get userDisplayName(): string {
    return this.user?.FullName || this.user?.Name || this.user?.UserName || 'Admin User';
  }

  get userRole(): string {
    return this.user?.Role || this.user?.UserRole || 'Club Admin';
  }
}
