import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/@shared/AlertService';
import {
  DataTablesResponse,
  IRoleModel,
  RoleService,
} from 'src/app/_fake/services/role.service';
import { SweetAlertOptions } from 'sweetalert2';

@Component({
  selector: 'app-role-listing',
  templateUrl: './role-listing.component.html',
  styleUrls: ['./role-listing.component.scss'],
})
export class RoleListingComponent implements OnInit, AfterViewInit, OnDestroy {

  roleVm :any;
  selectedId: any;
  selectedAll: boolean = false;


  spin: boolean = false;
  isCollapsed1 = false;

  isLoading = false;
  rolePermissionList: any[] = [];
  rolepermission: any;
  roleList: any[] = [];

  roles$: Observable<DataTablesResponse>;
  roleData: any;
  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  role: any;
  // Single model
  role$: Observable<IRoleModel>;
  roleModel: IRoleModel = { id: 0, name: '', permissions: [], users: [] };

  @ViewChild('formModal')
  formModal: TemplateRef<any>;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  modalConfig: NgbModalOptions = {
    modalDialogClass: 'modal-dialog modal-dialog-centered mw-650px',
  };
  roleForm:FormGroup;

  private clickListener: () => void;

  constructor(
    private apiService: RoleService,
    private _service: RoleService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private modalService: NgbModal,
    private _roleService: RoleService,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {}

  ngAfterViewInit(): void {
    this.clickListener = this.renderer.listen(document, 'click', (event) => {
      const closestBtn = event.target.closest('.btn');
      if (closestBtn) {
        const { action, id } = closestBtn.dataset;

        switch (action) {
          case 'view':
            break;

          case 'create':
            this.create();
            this.modalService.open(this.formModal, this.modalConfig);
            break;

          case 'edit':
            this.edit(id);
            this.modalService.open(this.formModal, this.modalConfig);
            break;

          case 'delete':
            break;
        }
      }
    });
  }

  ngOnInit(): void {
    // this.roles$ = this.apiService.getRoles();
    this.getAllList();
    this.getAllRolePermission();
    this.createRoleForm()
  }

  createRoleForm(){
    this.roleForm = this.fb.group({
      Id: 0,
      Name: [null, Validators.required],
    });
  }

  delete(id: number) {
    this.apiService.deleteRole(id).subscribe(() => {});
  }

  edit(id: number) {
    this.role$ = this.apiService.getRole(id);
    this.role$.subscribe((user: IRoleModel) => {
      this.roleModel = user;
    });
  }

  create() {
    this.roleModel = { id: 0, name: '', permissions: [], users: [] };
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
        this.roleModel.id > 0
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
      this.modalService.dismissAll();
      this.roles$ = this.apiService.getRoles();
      this.cdr.detectChanges();
    };

    const updateFn = () => {
      this.apiService.updateRole(this.roleModel.id, this.roleModel).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.reloadEvent.emit(true);
        },
        error: (error) => {
          errorAlert.text = this.extractText(error.error);
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
    };

    const createFn = () => {
      this.apiService.createRole(this.roleModel).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.reloadEvent.emit(true);
        },
        error: (error) => {
          errorAlert.text = this.extractText(error.error);
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
    };

    if (this.roleModel.id > 0) {
      updateFn();
    } else {
      createFn();
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
    if (this.clickListener) {
      this.clickListener();
    }
    this.modalService.dismissAll();
  }
  getAllRolePermission() {
    this.spin = true;
    this._service.getRolePermission().subscribe(
      (data) => {
        this.rolePermissionList = data;
        this.spin = false;
        this.cdr.detectChanges();
      },
      (err) => {
        this.spin = false;
      }
    );
  }
  viewPermission(role, viewPermissionModal) {
    this.selectedId = role.Id
    this.roleDetailById(viewPermissionModal)
  }
  getAllList() {
    this.spin = true; 
    this._service.getAllRole().subscribe(
      (data) => {
        this.roleList = data;
        console.log(this.roleList); 
        
        this.spin = false;
      },
      (err) => {
        this.spin = false;
      }
    );
  }
  viewRole(x, viewModal) {
    
    this.role = x;
    this.modalService.open(viewModal,{size:"lg"})
   
  }
  getRoleById(id: any) {
    this.spin = true;
    this._service.getRoleById(id).subscribe(
      (data) => {
        this.roleData = data;
        console.log(data);
        this.spin = false;
      },
      (err) => {
        this.spin = false;
      }
    );
  }
















  roleDetailById(viewModal?) {
    if (this.selectedId) {
      this._roleService.getRoleById(this.selectedId).subscribe(
        (data) => {
          this.roleVm = data
          if(viewModal){

            this.modalService.open(viewModal,{size:"lg"});
          }
        }
          
      );
    }
  }
  childSelected(x1: any) {}
  allChildSelected(x: any) {
    if (x.IsChecked) {
      this.roleVm.PermissionList.forEach((element: any) => {
        if (element == x) {
          element.PermissionDetailVms.forEach((e: any) => {
            e.IsChecked = true;
          });
          element.IsChecked = true;
        }
      });
    } else {
      this.roleVm.PermissionList.forEach((element: any) => {
        if (element == x) {
          element.PermissionDetailVms.forEach((e: any) => {
            e.IsChecked = false;
          });
          element.IsChecked = false;
        }
      });
    }
  }
  allSelected() {
    this.selectedAll = !this.selectedAll;
    if (this.selectedAll) {
      this.roleVm.PermissionList.forEach((element: any) => {
        element.IsChecked = true;
        element.PermissionDetailVms.forEach((e: any) => {
          e.IsChecked = true;
        });
      });
    } else {
      this.roleVm.PermissionList.forEach((element: any) => {
        element.IsChecked = false;
        element.PermissionDetailVms.forEach((e: any) => {
          e.IsChecked = false;
        });
      });
    }
  }

  // loadRoleList() {
  //   this.router.navigate(['/role/role-list']);
  // }
  // createButtonClick() {
  //   this._router.navigate(['/role/role-list']);
  // }
  saveRolePermission() {
    this._roleService.saveRolePermissionById(this.roleVm).subscribe(
      (res) => {
        this.alertService.success('Success');
        // this.loadRoleList();
      },
      (error: any) => {
        this.alertService.error('Error');
      }
    );
  }

  openNewRoleModal(addNewRoleModal){
    this.modalService.open(addNewRoleModal, {size:'lg'})
  }

  onSaveRole(){

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: 'Success!',
      text:
        this.roleModel.id > 0
          ? 'User updated successfully!'
          : 'User created successfully!',
    };
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: 'Error!',
      text: '',
    };



    this._service.createRole(this.roleForm.value).subscribe({
      next: () => {
        this.showAlert(successAlert);
        this.reloadEvent.emit(true);
        this.getAllList();
      },
      error: (error) => {
        errorAlert.text = this.extractText(error.error);
        this.showAlert(errorAlert);
        this.isLoading = false;
      },
    });
  }
  handleBlur(control: any): boolean {
    return control.dirty && control.invalid;
  }
}
