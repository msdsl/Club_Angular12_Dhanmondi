import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SweetAlertOptions } from 'sweetalert2';
import { UserService } from '../../user.service';
import { AlertService } from 'src/app/@shared/AlertService';

@Component({
  selector: 'app-user-logs',
  templateUrl: './user-logs.component.html',
  styleUrls: ['./user-logs.component.css']
})
export class UserLogsComponent implements OnInit {

  @Input() userId: any;

  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  limit: number = 100;
  userLogData: any;
  collectionSize: any;

  constructor(
    private alertType: AlertTypeService,
    private service: UserService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.getUserLogByUserId(1)
  }

  
  getUserLogByUserId(page: any) {
    if (this.userId > 0) {
      this.service.getUserLogsByUserId(page, this.limit, this.userId.toString()).subscribe((res) => {
        if (!res.HasError) {
          console.log(res);
          this.userLogData = res.DataList;
          this.collectionSize = res.DataCount;
        }
        (error: any) => {
          error.Messages.forEach((element: string) => {
            this.alertService.error(element);
          });
        };
      });
    }
  }

}
