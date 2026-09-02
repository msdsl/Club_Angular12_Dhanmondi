import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';

declare var $: any;
declare var Lobibox: any;

@Injectable()
export class AlertService {
  private subject = new Subject<void>();
  private keepAfterNavigationChange = false;

  constructor(private router: Router, private toastr: ToastrService) {
    // clear alert message on route change
    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterNavigationChange) {
          // only keep for a single location change
          this.keepAfterNavigationChange = false;
        } else {
          // clear alert
          this.subject.next();
        }
      }
    });
  }

  success(message: string, keepAfterNavigationChange = false) {
    this.toastr.success(message);
  }

  error(message: string, keepAfterNavigationChange = false) {
    this.toastr.error(message);
  }

  info(message: string, keepAfterNavigationChange = false) {
    this.toastr.info(message);
  }

  warning(message: string, keepAfterNavigationChange = false) {
    this.toastr.warning(message);
  }

  confirm(message: string, callBackMain: any) {
    var self = this;
    Lobibox.confirm({
      msg: message,
      title: 'Confirmation',
      callback: function ($this: any, type: any, ev: any) {
        if (type == 'yes') {
          callBackMain();
        }
      },
    });
  }

  confirm2(message: string, callyes: any, callNo: any) {
    var self = this;
    Lobibox.confirm({
      msg: message,
      title: 'Confirmation',
      callback: function ($this: any, type: any, ev: any) {
        if (type == 'yes') {
          callyes();
        } else if (type == 'no') {
          callNo();
        }
      },
    });
  }

  clear() {
    this.subject.next();
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
