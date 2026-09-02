import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { PasswordService } from './update-password.service';
import { AlertService } from 'src/app/@shared/AlertService';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
})
export class UpdatePasswordComponent implements OnInit {

  @ViewChild('confirmSwal')
  public readonly confirmSwal!: SwalComponent;

  isInsertMode: boolean = false;
  isUpdateMode: boolean = false;
  currentUser!: any;

  actionText = 'Save';
  titleText: string = 'User Setup';

  dtOptions: any = {};
  userData: any;
  public user: any = {}

  public dataList: any[] | undefined;
  mainUserInfo = JSON.parse(localStorage.getItem('currentBgclUser')!);

  constructor(private alertService: AlertService, private _passwordService: PasswordService) {
    this.isInsertMode = false;
  }

  backButtonClick() {
    this.isInsertMode = false;
  }


  saveButtonClick(id) {

    this.confirmSwal.fire().then((clicked) => {
      // if (clicked.isConfirmed) {
      //   this.showAlert(this.alertType.deleteSuccessAlert);
      // }
    });
  }
  changePassword() {
    this.user.Id = this.mainUserInfo.Id;
    this._passwordService.changePassword(this.user).subscribe(
      (res) => {
      this.alertService.success("Password Changed Successfully")
    },
    (err)=>{
      debugger
      this.alertService.error(err.error.Messages[0])
    }

  );
  }


  // saveButtonClick(f: NgForm) {
  //   if (f.invalid) {
  //     return;
  //   } else {
  //     Swal.fire({
  //       // title: ' ',
  //       text: 'Are you sure you want to reset password?',
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonColor: '#4255b5',
  //       cancelButtonColor: '#333',
  //       width: '20rem',
  //       confirmButtonText: 'Reset',
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         this.user.Id = this.mainUserInfo.Id;
  //         // console.log('B');
  //         this._passwordService.changePassword(this.user).subscribe((res) => {
  //           // console.log('B');

  //           // res..forEach((element) => {
  //           //   this.alertService.success(element);
  //           //   this.user ={}
  //           // });
  //           this.alertService.success("Password Changed Successfully")

  //         });
  //       }
  //     });
  //   }
  // }

  cancleButtonClick() {
    this.isInsertMode = false;
  }

  ngOnInit(): void {
    // console.log(this.mainUserInfo);
  }
}
