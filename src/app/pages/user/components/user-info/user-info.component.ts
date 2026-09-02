import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/@shared/AlertService';
import { SweetAlertOptions } from 'sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  @Input() userId: any;
  userForm: FormGroup;

  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  constructor(
    private fb:FormBuilder,
    private service: UserService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private alertService: AlertService,
    private alertType: AlertTypeService,
    private router: Router,
    private location: Location,
  ) { }

  ngOnInit() {
    this.createUserForm()
    if (this.userId) {
      this.getUserMenu(this.userId);
    }
  }

  goBack(): void {
    this.location.back();  // Go back to the previous page
  }

  getUserMenu(userId){
    this.service.getUserById(userId).subscribe(
      (data)=>{
        console.log(data);
        this.setDataToForm(data)
      },
      (err)=>{
        console.log(err);
      }
    )
  }

  setDataToForm(data) {
    this.userForm.patchValue({
      Id: data.Id,
      Name: data.Name,
      UserName: data.UserName,
      PhoneNo: data.PhoneNo,
      EmailId: data.EmailId,
      AppId: 'WEBAPP',
    });
  }


  createUserForm() {
    this.userForm = this.fb.group({
      Id: [0],
      Name: ['', Validators.required],
      UserName: ['', Validators.required],
      PhoneNo: [null],
      EmailId: [null],
      AppId: ['WEBAPP'],
    });
  }

  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  onSubmit(){
    
    if(this.userForm.invalid){
      this.alertService.warning('Please enter valid informations');
      return
    }
    this.service.createUser(this.userForm.value).subscribe(
      (data)=>{
        
        this.showCustomAlert(this.alertType.userCreatedSuccessAlert,data.Messages[0]);
        this.router.navigate(['user-management']);
        console.log();
      },
      (err)=>{
        this.showAlert(this.alertType.errorAlert);
        console.log(err);
      }
    )
  }
  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('User');
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

  showCustomAlert(swalOptions: SweetAlertOptions, message) {
    this.alertType.setAlertTypeText(message);
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
