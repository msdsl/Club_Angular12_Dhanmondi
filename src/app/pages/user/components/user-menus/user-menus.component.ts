import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SweetAlertOptions } from 'sweetalert2';
import { UserService } from '../../user.service';
import { AlertService } from 'src/app/@shared/AlertService';

@Component({
  selector: 'app-user-menus',
  templateUrl: './user-menus.component.html',
  styleUrls: ['./user-menus.component.css']
})
export class UserMenusComponent implements OnInit {

  @Input() userId: any;

  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  userMenusData: any[];
  userMenuReq: any[];

  constructor(
    private alertType: AlertTypeService,
    private service: UserService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.getUserMenusByUserId()
  }

  getUserMenusByUserId() {
    if (this.userId > 0) {
      this.service.getUserMenusByUserIdForPermission(this.userId.toString()).subscribe((res) => {
        if (!res.HasError) {
          this.userMenusData = res;
        }
        (error: any) => {
          error.Messages.forEach((element: string) => {
            this.alertService.error(element);
          });
        };
      });
    }
  }

  toggleCheckBoxMenu(data: any) {
    data.IsChecked = !data.IsChecked;
    if (data.IsChecked === false) {
      data.UserSubMenuRess.forEach((element) => {
        element.IsChecked = false;
      });
    }
    if (data.IsChecked === true) {
      data.UserSubMenuRess.forEach((element) => {
        element.IsChecked = true;
      });
    }
  }
  toggleCheckBoxSubMenu(data: any) {
    this.userMenusData.forEach((x) => {
      x.UserSubMenuRess.forEach((x1) => {
        if (x1.SubMenuId === data.SubMenuId) {
          x1.IsChecked = !x1.IsChecked;
          if (x1.IsChecked) {
            x.IsChecked = true;
          }
        }
      });
    });
  }

  saveUserMenu() {
    this.userMenuReq = [];
    this.userMenusData.forEach((item) => {
      if (item.IsChecked === true) {
        item.UserSubMenuRess.forEach((x) => {
          if (x.IsChecked === true) {
            var umr={
              MenuId: item.MenuId,
              SubMenuId: x.SubMenuId,
              UserId: this.userId
            } ;
            
            this.userMenuReq.push(umr);
          }
        });
      }
    });
    this.service.saveUserMenuByUser(this.userMenuReq, this.userId).subscribe(
      (res) => {
        if (!res.HasError) {
          this.alertService.success('Success');
          this.getUserMenusByUserId()
        }
      },
      (error: any) => {
        this.alertService.error('Failed');
      }
    );
  }

}
