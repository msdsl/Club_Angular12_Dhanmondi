import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';

import { MemberService } from '../../services/member.service';
import { MemberProfessionService } from '../../services/member-profession.service';

@Component({
  selector: 'app-member-profession',
  templateUrl: './member-profession.component.html',
  styleUrls: ['./member-profession.component.css']
})
export class MemberProfessionComponent implements OnInit {

  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;
  
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  numberOfEntries: number;
  currentPage: number;
  pageSize: number;
  searchForm: FormGroup;
  searchKey: any;
  spin: boolean = false;
  hasData: boolean = false;
  memberProfession: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList:any[] = [5,10,15,25,50,100];
  isFilter = false
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  memberProfessionForm:FormGroup;
  isForDeleteId: number;
  categoryList: any;




  constructor(
    private service: MemberProfessionService,
    private memberService: MemberService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private alertType:AlertTypeService,
  ) {}


  ngOnInit() {
    

    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0; 
    this.getMemberProfessionList();
    this.createFilterForm();
    this.createMemberProfessionForm();
  }

  createMemberProfessionForm() {
    this.memberProfessionForm = this.fb.group({
      Id: 0,
      Name: ["", Validators.required],

    });
  }




  toggleDropdown(index: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.isOpenAction = this.isOpenAction === index ? null : index;
  }

  closeDropdown(): void {
    this.isOpenAction = null;
  }
  createFilterForm() {
    this.searchForm = this.fb.group({
      pageSize: 10,
      searchKey: '',
    });

    this.searchForm.get('searchKey')?.valueChanges.subscribe((val) => {
      this.searchKey = val;
      this.currentPage = 1;
      this.getMemberProfessionList();
    });
  }

  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
    this.getMemberProfessionList();
  }

  onCancelButtonClick(){
    document.getElementById("close-button").click()
  }

  getMemberProfessionList() {
    this.spin = true;
    this.service
      .getMemberProfessionPagination(this.currentPage, this.pageSize, this.searchKey)
      .subscribe(
        (data) => {
          let list = data?.Data || [];
          if (this.searchKey && this.searchKey.trim() !== '') {
            const key = this.searchKey.trim().toLowerCase();
            const filtered = list.filter((item: any) =>
              item.Name && item.Name.toLowerCase().includes(key)
            );
            if (filtered.length > 0 || list.length === data.Count) {
              list = filtered;
            }
          }
          this.memberProfession = list;
          this.hasData = this.memberProfession?.length > 0;
          this.numberOfEntries = this.searchKey && this.searchKey.trim() !== ''
            ? this.memberProfession.length
            : (data?.Count ?? data?.DataCount ?? data?.TotalCount ?? (this.memberProfession ? this.memberProfession.length : 0));
          this.cdr.detectChanges();
        },
        (err) => {
          this.spin = false;
          this.hasData = false;
        }
      );
  }
  

  updatePageWiseTableData(event) {
    this.currentPage = event;
    this.getMemberProfessionList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    
    
    if (data?.Id) {
      // this.editId = id;
      this.memberProfessionForm.patchValue({
        Id : data.Id,
        Name : data.Name,
      })
    } else {
      // this.editId = null;
      this.memberProfessionForm.reset();
      this.memberProfessionForm.get("Id").patchValue(0);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg' });
  }


  reloadData() {
    this.currentPage = 1;
    this.getMemberProfessionList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getMemberProfessionList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  
  onSubmit() {

    if (!this.memberProfessionForm.valid) {
      this._alert.error("Please provide valid information");
      return;
    }

    this.service.createMemberProfession(this.memberProfessionForm.value).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this.alertType.errorAlert);
        } else {
          this.getMemberProfessionList()
          this.memberProfessionForm.value.Id?this.showAlert(this.alertType.updateSuccessAlert):this.showAlert(this.alertType.createSuccessAlert);
        }
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  deleteButtonClick(id) {
    

    this.isForDeleteId = id;
    this.deleteSwal.fire().then((clicked) => {
      
      // if (clicked.isConfirmed) {
      //   this.showAlert(this.alertType.deleteSuccessAlert);
       
      // }
    });
  }
  triggerDelete(){
    
    this.service.deleteMemberProfession(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getMemberProfessionList();
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
        
      }
    );
  }


  filterData(){
    this.searchKey = this.searchForm.get('searchKey')?.value || '';
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.getMemberProfessionList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    
    this.alertType.setAlertTypeText('MemberProfession')
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = Object.assign({
      buttonsStyling: false,
      confirmButtonText: "Ok, got it!",
      customClass: {
        confirmButton: "btn btn-" + style
      }
    }, swalOptions);
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }

}
