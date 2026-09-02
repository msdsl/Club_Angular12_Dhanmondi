import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SweetAlertOptions } from 'sweetalert2';
import { UserService } from '../../user.service';
import { AlertService } from 'src/app/@shared/AlertService';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.css']
})
export class UserRolesComponent implements OnInit {

  @Input() userId: any;

  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  rolePermissionList: any;


  constructor(
    private alertType: AlertTypeService,
    private service: UserService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,

  ) { }

  ngOnInit() {
    this.getUserRoleByUserId()
  }

  getUserRoleByUserId() {
    if (this.userId > 0) {
      this.service.getRoleByUserId(this.userId).subscribe((res) => {
        // ;
        if (!res.HasError) {
          this.rolePermissionList = res.DataList as any;
        }
        (error: any) => {
          error.Messages.forEach((element: string) => {
            this.alertService.error(element);
          });
        };
      });
    }
  }

  saveUserRole() {
    
    this.rolePermissionList;
    let data = {
      dataList: this.rolePermissionList,
    };

    this.service.saveUserRoleByUser(data).subscribe(
      (res) => {
        if (!res.HasError) {
          this.getUserRoleByUserId()
          this.alertService.success('Success');
        }
      },
      (error: any) => {
        this.alertService.error('Failed');
      }
    );
  }

  toggleCheckBoxUserRole(data: any) {
    data.IsChecked = !data.IsChecked;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('User Role');
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = Object.assign(
      {
        buttonsStyling: false,
        confirmButtonText: 'Ok, got it!',
        customClass: {
          confirmButton: 'btn btn-' + style,
        },
      },
      swalOptions
    );
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }

}
