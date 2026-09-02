import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Observable } from 'rxjs';
import {
  DataTablesResponse,
  IUserModel,
} from 'src/app/_fake/services/user-service';
import { SweetAlertOptions } from 'sweetalert2';
import moment from 'moment';
import { IRoleModel, RoleService } from 'src/app/_fake/services/role.service';
import { Config } from 'datatables.net';
import { UserService } from '../../user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';

@Component({
  selector: 'app-user-listing',
  templateUrl: './user-listing.component.html',
  styleUrls: ['./user-listing.component.scss'],
})
export class UserListingComponent implements OnInit, OnDestroy {
  @ViewChild('resetPasswordSwal')
  public readonly resetPasswordSwal!: SwalComponent;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  isFilter = true;
  numberOfEntries: number;
  currentPage: number;
  pageSize: number;
  searchForm: FormGroup;
  searchKey: any;
  spin: boolean = false;
  hasData: boolean = false;
  isCollapsed1 = false;
  isCollapsed2 = true;
  isLoading = false;
  isOpenAction: number | null = null;
  userForm: FormGroup;

  users: any[] = [];

  datatableConfig: Config = {};

  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  // Single model
  aUser: Observable<IUserModel>;
  userModel: IUserModel = { id: 0, name: '', email: '', role: '' };

  swalOptions: SweetAlertOptions = {};

  roles$: Observable<DataTablesResponse>;
  resetPasswordId: number;

  constructor(
    private _service: UserService,
    private roleService: RoleService,
    private _fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private router: Router,
    private alertType: AlertTypeService,
  ) { }

  ngOnInit(): void {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.createFilterForm();
    this.createForm();
    this.roles$ = this.roleService.getRoles();
    this.getList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }
  createForm() {
    this.userForm = this._fb.group({
      Id: [0],
      Name: ['', Validators.required],
      UserName: ['', Validators.required],
      PhoneNo: [null],
      EmailId: [null],
      AppId: ['WEBAPP'],
    });
  }
  goToCreatePage() {
    this.router.navigate(['user-management/create']);
  }


  goToEdit(id) {
    this.router.navigate(['user-management/edit/' + id]);
  }


  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  closeDropdown(): void {
    this.isOpenAction = null;
  }
  createFilterForm() {
    this.searchForm = this._fb.group({
      pageSize: 10,
      searchKey: null,
    });
  }

  careateOrEditModalPopUp(createOrUpdateModal: any) {
    this.modalService.open(createOrUpdateModal, { size: 'lg' });
  }
  filterData() {
    this.searchKey = this.searchForm.value.searchKey;
    this.pageSize = this.searchForm.value.pageSize;
    this.getList();
  }
  updatePageWiseTableData(event) {
    this.currentPage = event;
    this.getList();
  }
  getList() {
    this.spin = true;
    this._service
      .getPagination(this.currentPage, this.pageSize, this.searchKey)
      .subscribe(
        (data) => {
          this.users = data.Data;
          this.hasData = this.users?.length > 0;
          this.numberOfEntries = data.Count;
          this.cdr.detectChanges();
        },
        (err) => {
          this.spin = false;
          this.hasData = false;
        }
      );
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: 'Success!',
      text:
        this.userModel.id > 0
          ? 'User updated successfully!'
          : 'User created successfully!',
    };
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: 'Error!',
      text: '',
    };

    const completeFn = () => {
      this.isLoading = false;
    };

    if (this.userModel.id > 0) {
    } else {
    }
  }

  extractText(obj: any): string {
    var textArray: string[] = [];

    for (var key in obj) {
      if (typeof obj[key] === 'string') {
        // If the value is a string, add it to the 'textArray'
        textArray.push(obj[key]);
      } else if (typeof obj[key] === 'object') {
        // If the value is an object, recursively call the function and concatenate the results
        textArray = textArray.concat(this.extractText(obj[key]));
      }
    }

    // Use a Set to remove duplicates and convert back to an array
    var uniqueTextArray = Array.from(new Set(textArray));

    // Convert the uniqueTextArray to a single string with line breaks
    var text = uniqueTextArray.join('\n');

    return text;
  }

  showAlert(swalOptions: SweetAlertOptions) {
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

  ngOnDestroy(): void {
    this.reloadEvent.unsubscribe();
  }

  
  resetPasswordConfirmation(id) {
    this.resetPasswordId = id;

    this.resetPasswordSwal.fire().then((clicked) => {
      if (clicked.isConfirmed) {
        this.alertType.resetPasswordSuccessAlert.text = "Are you sure you want to reset password?"
        this.showAlert(this.alertType.resetPasswordSuccessAlert);
      }
    });

  }

  resetPassword() {
    this._service.resetPassword(this.resetPasswordId).subscribe(
      (data) => {
        console.log(data);
        
        this.alertType.resetPasswordSuccessAlert.text = data?.Messages[0];
        this.showAlert(this.alertType.resetPasswordSuccessAlert);

      },
      (err) => {
        console.log(err);

      }
    )
  }



}
