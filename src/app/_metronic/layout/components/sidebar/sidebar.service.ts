import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  navsSource = new BehaviorSubject<any[]>(this.getStoredNavs()); // Initialize with stored data
  navs$ = this.navsSource.asObservable();

  private getStoredNavs(): any[] {
    const storedNavs = localStorage.getItem('navs');
    return storedNavs ? JSON.parse(storedNavs) : [];
  }

  setNavs(navs: any[]) {
    this.navsSource.next(navs);
    localStorage.setItem('navs', JSON.stringify(navs)); // Store in localStorage
  }
}
