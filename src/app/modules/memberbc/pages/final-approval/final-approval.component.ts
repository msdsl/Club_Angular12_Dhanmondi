import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { CollegeService } from 'src/app/modules/setup/services/college.service';
import { MemberActiveStatusService } from 'src/app/modules/setup/services/member-active-status.service';
import { MemberProfessionService } from 'src/app/modules/setup/services/member-profession.service';
import { MemberTypeService } from 'src/app/modules/setup/services/member-type.service';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SweetAlertOptions } from 'sweetalert2';
import { MemberbcService } from '../../services/memberbc.service';
import { AlertService } from 'src/app/@shared/AlertService';
import { MemberApprovalStatus } from '../../Enum/MemberApprovalStatus.enum';


@Component({
  selector: 'app-final-approval',
  templateUrl: './final-approval.component.html',
  styleUrls: ['./final-approval.component.css']
})
export class FinalApprovalComponent implements OnInit {
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
  members: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = true;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  memberForm: FormGroup;
  isForDeleteId: number;
  isShowFilter: any = false;
  filterForm: any;

  toggleFilter() {
    this.isShowFilter = !this.isShowFilter;
  }
  reportFilterForm: any;
  memberTypes: any;
  memberActiveStatus: any;
  colleges: any;
  bloodGroups: any;
  memberProfessions: any;
  selectedColumnList: any[];
  note

  statuses: any[] = [
    {
      id: 1,
      name: 'Processing'
    },
    {
      id: 2,
      name: 'Recommended'
    },
    {
      id: 3,
      name: 'Initial Approval'
    },
    {
      id: 4,
      name: 'Final Approval'
    }
  ];

  memberSrc: Uint8Array;
  url: string;
  memberInfoList: any;
  pdfUrl: string;
  selectedStatus: any;
  currentMemberId: any;

  constructor(
    private service: MemberbcService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private alertType: AlertTypeService,
    private memberTypeService: MemberTypeService,
    private memberActiveStatusService: MemberActiveStatusService,
    private collegeService: CollegeService,
    private memberProfessionService: MemberProfessionService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.createFilterForm();
    this.getMemberList();

    this.creatememberForm();
    this.getMemberTypeList();
    this.getMemberActiveStatusList();
    this.getBloodGroupData();
    this.getMemberProfessionList();
  }

  getMemberProfessionList() {
    this.memberProfessionService
      .getMemberProfessionPagination(1, 1000)
      .subscribe(
        (data) => {
          this.memberProfessions = data.Data;
          this.cdr.detectChanges();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getBloodGroupData() {
    this.service.getAllBloodGroupData().subscribe(
      (res) => {
        this.bloodGroups = res.DataList;
        console.log(this.bloodGroups);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  getMemberTypeList() {
    this.memberTypeService.getMemberTypePagination(1, 1000).subscribe(
      (data) => {
        this.memberTypes = data.Data;
        this.cdr.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getMemberActiveStatusList() {
    this.memberActiveStatusService
      .getMemberActiveStatusPagination(1, 100)
      .subscribe(
        (data) => {
          this.memberActiveStatus = data.Data;
          this.cdr.detectChanges();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  creatememberForm() {
    this.memberForm = this.fb.group({
      Id: 0,
      Title: ['', Validators.required],
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
    this.filterForm = this.fb.group({
      MemberShipNo: null,
      FullName: null,
      CadetName: null,
      MemberTypeId: null,
      MemberActiveStatusId: null,
      Phone: null,
      Email: null,
      CollegeId: null,
      BatchNo: null,
      BloodGroupId: null,
      MemberProfessionId: null,
      Organaization: null,
      Designation: null,
      Specialization: null,
      HscYear: null,
      CadetNo: null,
      memFullId: null,
      MemberApprovalStatus: null
    });
  }

  resetFilterForm() {
    this.filterForm.reset();
  }

  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.getMemberList();
  }

  getMemberList() {
    this.filterForm.get("MemberApprovalStatus").patchValue(MemberApprovalStatus.Recommended)
    this.spin = true;
    this.service
      .getMemberPagination(
        this.currentPage,
        this.pageSize,
        this.searchKey,
        this.filterForm.value
      )
      .subscribe(
        (data) => {
          this.members = data.Data;
          this.hasData = this.members?.length > 0;
          this.numberOfEntries = data.Count;
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
    this.getMemberList();
  }






  filterData() {
    this.searchKey = this.searchForm.value.searchKey;
    this.pageSize = this.searchForm.value.pageSize;
    this.getMemberList();
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Member');
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



  openApprovalModal(memberApprovalModal,data) {

    this.currentMemberId = data.Id;
    this.selectedStatus = data.MemberApprovalStatus
    this.modalService.open(memberApprovalModal, { size: 'md', centered: true })
  }

  submitStatus(modal: any): void {
    
    var obj = {
      MemberId: this.currentMemberId,
      MemberApprovalStatusId: MemberApprovalStatus.Approved,
      MemberApprovalNote: this.note
    }
    
    this.service.updateMemberApprovalStatus(obj).subscribe(
      (data)=>{
        
        console.log(data);
        this.showAlert(this.alertType.memberApproveStatusUpdateSuccessAlert);
        this.getMemberList();
        modal.close();
      },
      (err)=>{
        console.log(err);
        this.showAlert(this.alertType.memberApproveStatusUpdateErrorAlert);
      }
    )
  }

}
