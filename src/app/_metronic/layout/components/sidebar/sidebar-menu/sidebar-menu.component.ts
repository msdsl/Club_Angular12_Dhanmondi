import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SidebarService } from '../sidebar.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
})
export class SidebarMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  navs: any[] = [];
  private routerSub?: Subscription;
  private navsSub?: Subscription;

  constructor(
    private sidebarService: SidebarService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.navs = this.sidebarService.navsSource.getValue() || [];

    this.navsSub = this.sidebarService.navs$.subscribe((data) => {
      this.navs = data || [];
      this.cdr.detectChanges();
    });

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }

  ngAfterViewInit(): void {
    this.navs = this.sidebarService.navsSource.getValue() || [];
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
    if (this.navsSub) {
      this.navsSub.unsubscribe();
    }
  }

  isChildActive(menu: any): boolean {
    if (!menu) return false;
    if (menu.Url && this.router.isActive(menu.Url, false)) {
      return true;
    }
    if (!menu.UserSubMenuRess || menu.UserSubMenuRess.length === 0) {
      return false;
    }
    return menu.UserSubMenuRess.some((sub: any) => {
      if (!sub.Url) return false;
      return this.router.isActive(sub.Url, false);
    });
  }

  isMenuOpen(menu: any): boolean {
    if (menu.isOpen !== undefined) {
      return menu.isOpen;
    }
    return this.isChildActive(menu);
  }

  toggleMenu(menu: any, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    menu.isOpen = !this.isMenuOpen(menu);
  }

  getMenuIcon(name: string, backendIcon?: string): string {
    if (backendIcon && backendIcon.trim() && backendIcon !== 'element-plus') {
      return backendIcon;
    }
    const n = (name || '').toLowerCase();
    if (n.includes('dash')) return 'element-11';
    if (n.includes('bc') && n.includes('member')) return 'user-square';
    if (n.includes('member')) return 'user';
    if (n.includes('sale') || n.includes('venue') || n.includes('ticket')) return 'basket';
    if (n.includes('subscri') || n.includes('fee')) return 'bill';
    if (n.includes('topup') || n.includes('top-up')) return 'dollar';
    if (n.includes('meeting') || n.includes('board')) return 'calendar-tick';
    if (n.includes('committee')) return 'briefcase';
    if (n.includes('sms')) return 'sms';
    if (n.includes('email') || n.includes('mail')) return 'directbox-default';
    if (n.includes('setup') || n.includes('setting') || n.includes('config')) return 'setting-2';
    if (n.includes('report')) return 'chart-line-star';
    if (n.includes('user') || n.includes('role') || n.includes('permission')) return 'security-user';
    if (n.includes('activity')) return 'time';
    return 'category';
  }

  getMenuThemeClass(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('dash')) return 'theme-cyan';
    if (n.includes('bc') && n.includes('member')) return 'theme-fuchsia';
    if (n.includes('member')) return 'theme-purple';
    if (n.includes('sale') || n.includes('venue') || n.includes('ticket')) return 'theme-emerald';
    if (n.includes('subscri') || n.includes('fee')) return 'theme-amber';
    if (n.includes('topup') || n.includes('top-up')) return 'theme-green';
    if (n.includes('meeting') || n.includes('board')) return 'theme-blue';
    if (n.includes('committee')) return 'theme-rose';
    if (n.includes('sms')) return 'theme-sky';
    if (n.includes('email') || n.includes('mail')) return 'theme-violet';
    if (n.includes('setup') || n.includes('setting')) return 'theme-indigo';
    if (n.includes('report')) return 'theme-yellow';
    if (n.includes('user') || n.includes('role') || n.includes('permission')) return 'theme-teal';
    return 'theme-default';
  }
}
