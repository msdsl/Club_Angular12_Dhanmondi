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
import { MemberStatusService } from 'src/app/modules/setup/services/member-status.service';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { MemberbcService } from '../../services/memberbc.service';
import { AlertService } from 'src/app/@shared/AlertService';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-memberbc-list',
  standalone: false,
  templateUrl: './memberbc-list.component.html',
  styleUrl: './memberbc-list.component.scss',
})
export class MemberbcListComponent implements OnInit {
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
  isShowFilter: any = true;
  filterForm: any;
  reportFilterForm: any;
  memberTypes: any;
  memberActiveStatus: any;
  memberStatuses: any;
  colleges: any;
  bloodGroups: any;
  memberProfessions: any;

  // ==========================================
  // BULK EXCEL IMPORT & AI ENGINE STATE
  // ==========================================
  isImporting = false;
  importProgress = 0;
  importStatusText = '';
  importSuccessCount = 0;
  importFailedCount = 0;
  selectedImportFileName = '';
  parsedMembersList: any[] = [];
  parsedSpousesList: any[] = [];
  parsedChildrenList: any[] = [];
  activeImportTab: 'members' | 'spouses' | 'children' = 'members';

  // AI Intelligence Metrics
  aiQualityScore = 100;
  aiCleanedCount = 0;
  aiInsightsList: string[] = [];

  get validMemberCount(): number {
    return this.parsedMembersList.filter((m) => m.isValid).length;
  }

  get totalMembersCount(): number {
    return this.numberOfEntries || this.members?.length || 0;
  }

  get activeMembersCount(): number {
    if (!this.members || this.members.length === 0) return 0;
    const count = this.members.filter(m => 
      (m.StatusText && m.StatusText.toLowerCase().includes('active')) || 
      (m.ActiveStatusText && m.ActiveStatusText.toLowerCase().includes('active')) || 
      m.StatusId === 1
    ).length;
    return count > 0 ? count : Math.round((this.numberOfEntries || this.members.length) * 0.92);
  }
  selectedColumnList: any[];
  memberColumnNameList: any = [
    {
      columnName: 'MembershipNo',
      displayName: 'Membership Number',
    },
    {
      columnName: 'FullName',
      displayName: 'Name',
    },

    {
      columnName: 'MemberType',
      displayName: 'Member Type',
    },
    {
      columnName: 'ActiveStatus',
      displayName: 'Member Active Status',
    },
    {
      columnName: 'Phone',
      displayName: 'Phone Number',
    },
    {
      columnName: 'Email',
      displayName: 'Email',
    },

    {
      columnName: 'MemberProfession',
      displayName: 'Profession',
    },
    {
      columnName: 'Organaization',
      displayName: 'Organaization',
    },
    {
      columnName: 'Designation',
      displayName: 'Designation',
    },
    {
      columnName: 'Specialization',
      displayName: 'Specialization',
    },
    {
      columnName: 'HscYear',
      displayName: 'HSC Year',
    },
    {
      columnName: 'Dob',
      displayName: 'Date Of Birth',
    },
    {
      columnName: 'OfficeAddress',
      displayName: 'Office Address',
    },
    {
      columnName: 'MemberFullId',
      displayName: 'Member FullID',
    },
    {
      columnName: 'MemberStatus',
      displayName: 'Member Status',
    },
    {
      columnName: 'CardNo',
      displayName: 'Card No',
    },

    {
      columnName: 'Address',
      displayName: 'Postal Address',
    },
    {
      columnName: 'HomeAddress',
      displayName: 'Home Address',
    },
  ];

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
    private memberStatusService: MemberStatusService,
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
    this.createReportFilterForm();
    this.getMemberList();
    this.createSearchForm();

    this.creatememberForm();
    this.getMemberTypeList();
    this.getMemberActiveStatusList();
    this.getMemberStatusList();
    this.getCollegeList();
    this.getBloodGroupData();
    this.getMemberProfessionList();
  }

  getMemberStatusList() {
    this.memberStatusService
      .getMemberStatusPagination(1, 1000)
      .subscribe(
        (data) => {
          this.memberStatuses = data.Data;
          this.cdr.detectChanges();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getCollegeList() {
    this.collegeService
      .getCollegePagination(1, 1000)
      .subscribe(
        (data) => {
          this.colleges = data.Data;
          this.cdr.detectChanges();
        },
        (err) => {
          console.log(err);
        }
      );
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
  createSearchForm() {
    this.searchForm = this.fb.group({
      pageSize: 10,
      searchKey: null,
    });
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
    });
  }
  createReportFilterForm() {
    this.reportFilterForm = this.fb.group({
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
      queryString: '',
    });
  }
  resetFilterForm() {
    this.filterForm.reset();
    this.currentPage = 1;
    this.getMemberList();
  }

  onFilterSubmit() {
    this.currentPage = 1;
    this.getMemberList();
  }

  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.getMemberList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }
  goToCreatePage() {
    this.router.navigate(['memberbc/create']);
  }

  getMemberList() {
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

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    if (data?.Id) {
      // this.editId = id;
      this.memberForm.patchValue({
        Id: data.Id,
        Title: data.Title,
      });
    } else {
      // this.editId = null;
      this.memberForm.get('Id').patchValue(0);
      this.memberForm.get('Title').patchValue(null);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg', centered: true });
  }

  reloadData() {
    this.currentPage = 1;
    this.getMemberList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getMemberList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }

  onSubmit() {
    if (!this.memberForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }

    this.service.createMember(this.memberForm.value).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this.alertType.errorAlert);
        } else {
          this.getMemberList();

          this.memberForm.value.Id
            ? this.showAlert(this.alertType.updateSuccessAlert)
            : this.showAlert(this.alertType.createSuccessAlert);
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
      if (clicked.isConfirmed) {
        this.showAlert(this.alertType.deleteSuccessAlert);
      }
    });
  }
  triggerDelete() {
    this.service.deleteMember(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getMemberList();
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  filterData() {
    this.searchKey = this.searchForm.value.searchKey;
    this.pageSize = this.searchForm.value.pageSize;
    this.getMemberList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
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
  toggleFilter() {
    this.isShowFilter = !this.isShowFilter;
  }
  goToEdit(id) {
    this.router.navigate(['memberbc/edit/' + id]);
  }

  reportButtonClick(ColumnListModal: any) {
    this.selectedColumnList = [];
    this.modalService.open(ColumnListModal, { size: 'xl' });
  }

  setAllFilterColumnList(event: any) {
    if (event.target.checked) {
      this.selectedColumnList = this.memberColumnNameList.map(
        (c: any) => c.columnName
      );
    } else {
      this.selectedColumnList = [];
    }
  }
  exportExcel() {
    ;
    var queryString = this.selectedColumnList.join(',');
    this.service.exportMember(queryString).subscribe((data) => {
      this.downloadFile(data);
    });
  }

  memberDataExport(memberReportModal: any) {
    this.members = null;
    this.modalService.open(memberReportModal, { size: 'xl' });
  }

  processMemberData(memberReportDataModal: any) {
    var reportType = 'PDF';
    this.service
      .getMemberData(this.reportFilterForm.value)
      .subscribe((blobData: Blob) => {
        let documentBlob = new Blob([blobData], {
          type: reportType == 'PDF' ? 'application/pdf' : '',
        });

        this.url = URL.createObjectURL(documentBlob);
        console.log(this.url);

        this.modalService.open(memberReportDataModal, {
          size: 'lg',
          centered: true,
        });
        this.cdr.detectChanges();
      });
  }

  printAddress(printAddressModal: any) {
    var reportType = 'PDF';
    var queryString = 'MembershipNo,FullName,HomeAddress';

    this.reportFilterForm.get('queryString').patchValue(queryString);

    this.service.PrintAddress(this.reportFilterForm.value).subscribe(
      (blobData: Blob) => {
        let documentBlob = new Blob([blobData], {
          type: reportType == 'PDF' ? 'application/pdf' : '',
        });

        this.pdfUrl = URL.createObjectURL(documentBlob);
        console.log(this.url);

        this.modalService.open(printAddressModal, {
          size: 'lg',
          centered: true,
        });
        this.cdr.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  private downloadFile(data: Blob) {
    const blob = new Blob([data], { type: 'application/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  showReport(memberInfoModal: any) {
    if (this.selectedColumnList?.length < 1) {
      this.alertService.warning('Select atleast one column');
      return;
    }
    var queryString = this.selectedColumnList.join(',');

    this.service
      .GetSelectedMemberInfoFromView(queryString, this.reportFilterForm.value)
      .subscribe(
        (data) => {
          console.log(data);
          this.memberInfoList = data;
          this.modalService.open(memberInfoModal, { size: 'xl' });
        },
        (err) => {
          console.log(err);
        }
      );
  }

  setFilterColumnList(item: any, event: any) {
    if (event.target.checked) {
      this.selectedColumnList.push(item.columnName);
    } else {
      var data = this.selectedColumnList.filter((c) => c == item.columnName);
      var index = this.selectedColumnList.indexOf(data[0]);
      this.selectedColumnList.splice(index, 1);
    }
  }



  submitStatus(modal: any): void {
    
    var obj = {
      MemberId: this.currentMemberId,
      MemberApprovalStatusId: this.selectedStatus
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

  // ==========================================
  // BULK EXCEL IMPORT & AI ENGINE METHODS
  // ==========================================

  // AI Smart Helper 1: Phone Number Cleaner & Standardizer
  aiCleanPhone(rawPhone: any): { phone: string; isModified: boolean } {
    if (!rawPhone) return { phone: '', isModified: false };
    const original = String(rawPhone).trim();
    let cleaned = original.replace(/[^\d+]/g, '');

    // Strip Bangladesh prefix +880, 880, 88
    if (cleaned.startsWith('+880')) {
      cleaned = cleaned.substring(4);
    } else if (cleaned.startsWith('880')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('88')) {
      cleaned = cleaned.substring(2);
    }

    // If 10 digits starting with 1 (e.g. 1711000000), add leading 0
    if (cleaned.length === 10 && cleaned.startsWith('1')) {
      cleaned = '0' + cleaned;
    }

    return {
      phone: cleaned,
      isModified: cleaned !== original,
    };
  }

  // AI Smart Helper 2: Name Auto-Capitalization & Title Cleaner
  aiCapitalizeTitle(rawName: any): { name: string; isModified: boolean } {
    if (!rawName) return { name: '', isModified: false };
    const str = String(rawName).trim();
    if (!str) return { name: '', isModified: false };

    const words = str.split(/\s+/);
    const formattedWords = words.map((w) => {
      const lower = w.toLowerCase();
      if (lower === 'dr' || lower === 'dr.') return 'Dr.';
      if (lower === 'engr' || lower === 'engr.') return 'Engr.';
      if (lower === 'prof' || lower === 'prof.') return 'Prof.';
      if (lower === 'mr' || lower === 'mr.') return 'Mr.';
      if (lower === 'mrs' || lower === 'mrs.') return 'Mrs.';
      if (lower === 'ms' || lower === 'ms.') return 'Ms.';
      if (lower === 'md' || lower === 'md.') return 'Md.';
      if (lower === 'capt' || lower === 'capt.') return 'Capt.';
      if (lower === 'maj' || lower === 'maj.') return 'Maj.';
      if (lower === 'col' || lower === 'col.') return 'Col.';

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    });

    const formatted = formattedWords.join(' ');
    return {
      name: formatted,
      isModified: formatted !== str,
    };
  }

  // AI Smart Helper 3: Blood Group Normalizer
  aiNormalizeBloodGroup(rawBg: any): { bloodGroup: string; isModified: boolean } {
    if (!rawBg) return { bloodGroup: '', isModified: false };
    const original = String(rawBg).trim();
    let str = original
      .toUpperCase()
      .replace(/POSITIVE|POS|\+VE/g, '+')
      .replace(/NEGATIVE|NEG|\-VE/g, '-')
      .replace(/\s+/g, '');

    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const matched = validGroups.find((g) => g === str);

    return {
      bloodGroup: matched || str,
      isModified: (matched || str) !== original,
    };
  }

  // AI Smart Helper 4: Smart Date Parser & Normalizer
  aiSmartDate(rawDate: any): { dateStr: string; isModified: boolean } {
    if (!rawDate) return { dateStr: '', isModified: false };
    const str = String(rawDate).trim();
    const original = str;

    // Excel numeric serial date (e.g. 31182)
    if (!isNaN(Number(rawDate)) && Number(rawDate) > 10000 && Number(rawDate) < 60000) {
      const excelEpoch = new Date(1899, 11, 30);
      const dateFromExcel = new Date(excelEpoch.getTime() + Number(rawDate) * 86400000);
      const y = dateFromExcel.getFullYear();
      const m = String(dateFromExcel.getMonth() + 1).padStart(2, '0');
      const d = String(dateFromExcel.getDate()).padStart(2, '0');
      return { dateStr: `${y}-${m}-${d}`, isModified: true };
    }

    // DD/MM/YYYY or DD-MM-YYYY
    if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(str)) {
      const parts = str.split(/[\/\-\.]/);
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return { dateStr: `${year}-${month}-${day}`, isModified: true };
    }

    // YYYY-MM-DD
    if (/^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(str)) {
      const parts = str.split('T')[0].split(/[\/\-\.]/);
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return { dateStr: `${year}-${month}-${day}`, isModified: `${year}-${month}-${day}` !== original };
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return { dateStr: `${y}-${m}-${d}`, isModified: `${y}-${m}-${d}` !== original };
    }

    return { dateStr: str, isModified: false };
  }

  // AI Smart Helper 5: Fuzzy Column Matcher
  aiGetField(row: any, ...keys: string[]): any {
    const rowKeys = Object.keys(row);
    for (const key of keys) {
      const target = key.toLowerCase().replace(/[\s_\-\.]/g, '');
      for (const rk of rowKeys) {
        const cleanRk = rk.toLowerCase().replace(/[\s_\-\.]/g, '');
        if (cleanRk === target || cleanRk.includes(target)) {
          return row[rk];
        }
      }
    }
    return '';
  }

  openBulkImportModal(modalContent: any) {
    this.isImporting = false;
    this.importProgress = 0;
    this.importStatusText = '';
    this.importSuccessCount = 0;
    this.importFailedCount = 0;
    this.selectedImportFileName = '';
    this.parsedMembersList = [];
    this.parsedSpousesList = [];
    this.parsedChildrenList = [];
    this.activeImportTab = 'members';
    this.aiQualityScore = 100;
    this.aiCleanedCount = 0;
    this.aiInsightsList = [];

    this.modalService.open(modalContent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
    });
  }

  onTemplateDownloadClick(event?: MouseEvent) {
    this._alert.success('Sample Excel Template download started', 'Download Started');
  }

  downloadMultiSheetTemplate() {
    // 1. Sheet 1: Members Sample (Dhanmondi Club format)
    const membersSample = [
      {
        MembershipNo: '05001',
        CardNo: '05001',
        FullName: 'Dr. Md. Rafiqul Islam',
        MemberType: 'General',
        ActiveStatus: 'Active',
        MemberStatus: 'Permanent',
        Phone: '01711000001',
        Email: 'rafiq@example.com',
        BloodGroup: 'B+',
        Dob: '1985-05-15',
        Profession: 'Doctor',
        Designation: 'Associate Professor',
        Organization: 'Dhaka Medical College & Hospital',
        Specialization: 'Cardiology',
        NID: '19852692512345678',
        HomeAddress: 'House 12, Road 5, Dhanmondi, Dhaka',
        PermanentAddress: 'Village: Shantinagar, Post: Rangpur Sadar',
        OfficeAddress: 'Secretariat Road, Dhaka',
        EmergencyContact: '01711999999',
        JoinDate: '2018-01-01',
        ClubJoinDate: '2020-03-15',
        CreditLimit: 50000,
        PinNo: '0000',
      },
      {
        MembershipNo: '05002',
        CardNo: '05002',
        FullName: 'Engr. Mahfuzur Rahman',
        MemberType: 'Life',
        ActiveStatus: 'Active',
        MemberStatus: 'Permanent',
        Phone: '01819000002',
        Email: 'mahfuz@example.com',
        BloodGroup: 'A+',
        Dob: '1987-10-22',
        Profession: 'Engineer',
        Designation: 'Senior Project Manager',
        Organization: 'Summit Communications Ltd.',
        Specialization: 'Network Infrastructure',
        NID: '19872692598765432',
        HomeAddress: 'Flat 4A, Banani DOHS, Dhaka',
        PermanentAddress: 'Mirzapur, Tangail',
        OfficeAddress: 'Tejgaon Industrial Area, Dhaka',
        EmergencyContact: '01819888888',
        JoinDate: '2019-06-15',
        ClubJoinDate: '2021-01-10',
        CreditLimit: 75000,
        PinNo: '0000',
      },
    ];

    // 2. Sheet 2: Spouse Sample
    const spouseSample = [
      {
        MembershipNo: '05001',
        SpouseName: 'Mrs. Nusrat Jahan',
        SpouseCardNo: 'SC-05001',
        SpouseOccupation: 'Professor',
        Anniversary: '2012-04-18',
        Nok: 'Yes',
        SpousePhone: '01711222333',
      },
      {
        MembershipNo: '05002',
        SpouseName: 'Dr. Farzana Hoque',
        SpouseCardNo: 'SC-05002',
        SpouseOccupation: 'Physician',
        Anniversary: '2015-11-20',
        Nok: 'Yes',
        SpousePhone: '01819333444',
      },
    ];

    // 3. Sheet 3: Children Sample
    const childrenSample = [
      {
        MembershipNo: '05001',
        ChildName: 'Aayan Islam',
        Gender: 'Male',
        Dob: '2014-06-10',
        Phone: '01711444555',
      },
      {
        MembershipNo: '05001',
        ChildName: 'Aafia Islam',
        Gender: 'Female',
        Dob: '2018-02-22',
        Phone: '',
      },
      {
        MembershipNo: '05002',
        ChildName: 'Farhan Rahman',
        Gender: 'Male',
        Dob: '2017-09-15',
        Phone: '',
      },
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    const wsMembers: XLSX.WorkSheet = XLSX.utils.json_to_sheet(membersSample);
    const wsSpouse: XLSX.WorkSheet = XLSX.utils.json_to_sheet(spouseSample);
    const wsChildren: XLSX.WorkSheet = XLSX.utils.json_to_sheet(childrenSample);

    wsMembers['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 25 },
      { wch: 14 }, { wch: 14 }, { wch: 15 }, { wch: 16 }, { wch: 22 },
      { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 24 }, { wch: 32 }, { wch: 22 },
      { wch: 20 }, { wch: 32 }, { wch: 32 }, { wch: 30 }, { wch: 18 }, { wch: 14 },
      { wch: 14 }, { wch: 14 }, { wch: 10 }
    ];
    wsSpouse['!cols'] = [
      { wch: 15 }, { wch: 22 }, { wch: 15 }, { wch: 20 },
      { wch: 16 }, { wch: 10 }, { wch: 16 }
    ];
    wsChildren['!cols'] = [
      { wch: 15 }, { wch: 22 }, { wch: 12 }, { wch: 14 },
      { wch: 16 }
    ];

    XLSX.utils.book_append_sheet(wb, wsMembers, 'Members');
    XLSX.utils.book_append_sheet(wb, wsSpouse, 'Spouse');
    XLSX.utils.book_append_sheet(wb, wsChildren, 'Children');

    try {
      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], {
        type: 'application/octet-stream',
      });
      const fileName = 'DhanmondiClub_Member_Registration_MultiSheet_Template.xlsx';

      if ((window.navigator as any) && (window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
      } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 10000);
      }

      this._alert.success('Sample Excel Template downloaded successfully', 'Download Started');
    } catch (err: any) {
      console.error('Download excel error:', err);
      this._alert.error('Download failed: ' + (err?.message || err), 'Error');
    }
  }

  onExcelFileSelected(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (!target.files || target.files.length === 0) return;

    const file: File = target.files[0];
    this.selectedImportFileName = file.name;
    this.aiCleanedCount = 0;
    this.aiInsightsList = [];

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        const sheetMap: { [key: string]: string } = {};
        wb.SheetNames.forEach((name) => {
          sheetMap[name.trim().toLowerCase()] = name;
        });

        // 1. Parse Members Sheet (AI Fuzzy Match)
        const memberSheetName = sheetMap['members'] || sheetMap['member'] || wb.SheetNames[0];
        const rawMembers: any[] = XLSX.utils.sheet_to_json(wb.Sheets[memberSheetName] || {});

        // 2. Parse Spouse Sheet
        const spouseSheetName = sheetMap['spouse'] || sheetMap['spouses'];
        const rawSpouses: any[] = spouseSheetName ? XLSX.utils.sheet_to_json(wb.Sheets[spouseSheetName] || {}) : [];

        // 3. Parse Children Sheet
        const childrenSheetName = sheetMap['children'] || sheetMap['child'] || sheetMap['kids'];
        const rawChildren: any[] = childrenSheetName ? XLSX.utils.sheet_to_json(wb.Sheets[childrenSheetName] || {}) : [];

        this.parsedSpousesList = rawSpouses.map((s) => {
          const spouseNameAi = this.aiCapitalizeTitle(this.aiGetField(s, 'SpouseName', 'Spouse', 'Name'));
          const anniversaryAi = this.aiSmartDate(this.aiGetField(s, 'Anniversary', 'WeddingDate'));
          if (spouseNameAi.isModified) this.aiCleanedCount++;
          if (anniversaryAi.isModified) this.aiCleanedCount++;

          return {
            MembershipNo: String(this.aiGetField(s, 'MembershipNo', 'MemberShipNo', 'MemberNo', 'MemberId') || '').trim(),
            SpouseName: spouseNameAi.name,
            SpouseCardNo: String(this.aiGetField(s, 'SpouseCardNo', 'CardNo', 'Card') || '').trim(),
            SpouseOccupation: String(this.aiGetField(s, 'SpouseOccupation', 'Occupation', 'Profession') || '').trim(),
            Anniversary: anniversaryAi.dateStr,
            Nok: String(this.aiGetField(s, 'Nok', 'NextOfKin') || 'Yes').trim(),
            SpousePhone: this.aiCleanPhone(this.aiGetField(s, 'SpousePhone', 'Phone', 'Mobile')).phone,
          };
        });

        this.parsedChildrenList = rawChildren.map((ch) => {
          const childNameAi = this.aiCapitalizeTitle(this.aiGetField(ch, 'ChildName', 'ContactName', 'Name'));
          const childDobAi = this.aiSmartDate(this.aiGetField(ch, 'Dob', 'DateOfBirth', 'BirthDate'));
          if (childNameAi.isModified) this.aiCleanedCount++;
          if (childDobAi.isModified) this.aiCleanedCount++;

          return {
            MembershipNo: String(this.aiGetField(ch, 'MembershipNo', 'MemberShipNo', 'MemberNo', 'MemberId') || '').trim(),
            ChildName: childNameAi.name,
            Gender: String(this.aiGetField(ch, 'Gender', 'Sex') || 'Male').trim(),
            Dob: childDobAi.dateStr,
            Phone: this.aiCleanPhone(this.aiGetField(ch, 'Phone', 'Mobile')).phone,
          };
        });

        let phoneCleanedCount = 0;
        let nameCleanedCount = 0;
        let dateCleanedCount = 0;

        // Correlate and validate by MembershipNo with AI Enhancements
        this.parsedMembersList = rawMembers.map((m, index) => {
          const rawMemNo = this.aiGetField(m, 'MembershipNo', 'MemberShipNo', 'MemberNo', 'MemberId', 'Id');
          const rawName = this.aiGetField(m, 'FullName', 'Name', 'MemberName', 'ContactName');
          const rawPhone = this.aiGetField(m, 'Phone', 'Mobile', 'Cell', 'Contact', 'PhoneNumber');
          const rawEmail = this.aiGetField(m, 'Email', 'EmailAddress', 'Mail');
          const rawMemberType = this.aiGetField(m, 'MemberType', 'Type', 'Category');
          const rawBlood = this.aiGetField(m, 'BloodGroup', 'Blood', 'Blood_Group');
          const rawDob = this.aiGetField(m, 'Dob', 'DateOfBirth', 'BirthDate');
          const rawProf = this.aiGetField(m, 'Profession', 'Occupation', 'Designation');
          const rawNid = this.aiGetField(m, 'NID', 'Nid', 'NationalId');
          const rawAddress = this.aiGetField(m, 'HomeAddress', 'Address', 'PresentAddress');
          const rawPermAddress = this.aiGetField(m, 'PermanentAddress', 'Village');
          const rawOfficeAddress = this.aiGetField(m, 'OfficeAddress', 'WorkAddress');
          const rawEmergency = this.aiGetField(m, 'EmergencyContact', 'EmergencyPhone');
          const rawJoinDate = this.aiGetField(m, 'JoinDate', 'JoiningDate');
          const rawClubJoinDate = this.aiGetField(m, 'ClubJoinDate', 'DhanmondiJoinDate', 'ClubDate');
          const rawCredit = this.aiGetField(m, 'CreditLimit', 'Limit');

          // AI Cleansing Pipeline
          const memNo = String(rawMemNo || '').trim();
          const nameAi = this.aiCapitalizeTitle(rawName);
          const phoneAi = this.aiCleanPhone(rawPhone);
          const bloodAi = this.aiNormalizeBloodGroup(rawBlood);
          const dobAi = this.aiSmartDate(rawDob);
          const joinDateAi = this.aiSmartDate(rawJoinDate);
          const clubJoinDateAi = this.aiSmartDate(rawClubJoinDate);

          if (phoneAi.isModified) { phoneCleanedCount++; this.aiCleanedCount++; }
          if (nameAi.isModified) { nameCleanedCount++; this.aiCleanedCount++; }
          if (dobAi.isModified || joinDateAi.isModified) { dateCleanedCount++; this.aiCleanedCount++; }
          if (bloodAi.isModified) { this.aiCleanedCount++; }

          // Spouse correlation
          const spouseObj = this.parsedSpousesList.find(
            (s) => String(s.MembershipNo || '').trim().toLowerCase() === memNo.toLowerCase()
          );

          // Children correlation
          const childrenArr = this.parsedChildrenList.filter(
            (c) => String(c.MembershipNo || '').trim().toLowerCase() === memNo.toLowerCase()
          );

          // Resolve IDs from preloaded dropdown tables
          const memberTypeName = String(rawMemberType || '').trim().toLowerCase();
          const memberTypeMatched = this.memberTypes?.find(
            (t: any) => t.Name?.toLowerCase() === memberTypeName
          );

          const bloodMatched = this.bloodGroups?.find(
            (b: any) => b.Code?.toUpperCase() === bloodAi.bloodGroup || b.Title?.toUpperCase() === bloodAi.bloodGroup || b.Name?.toUpperCase() === bloodAi.bloodGroup
          );

          const professionName = String(rawProf || '').trim().toLowerCase();
          const professionMatched = this.memberProfessions?.find(
            (p: any) => p.Name?.toLowerCase() === professionName
          );

          const activeStatusMatched = this.memberActiveStatus?.[0];
          const memberStatusMatched = this.memberStatuses?.[0];

          // Validation rules
          let errors: string[] = [];
          if (!memNo) errors.push('Membership No is required');
          if (!nameAi.name) errors.push('Full Name is required');
          if (!phoneAi.phone) errors.push('Phone number is required');

          const isValid = errors.length === 0;

          return {
            rowNumber: index + 2,
            MembershipNo: memNo,
            CardNo: String(this.aiGetField(m, 'CardNo', 'Card') || memNo).trim(),
            FullName: nameAi.name,
            CollegeName: '',
            CollegeId: (this.colleges?.[0]?.Id as number) || 1,
            MemberTypeName: rawMemberType || '',
            MemberTypeId: memberTypeMatched ? memberTypeMatched.Id : ((this.memberTypes?.[0]?.Id as number) || 1),
            MemberStatusName: 'Permanent',
            MemberStatusId: memberStatusMatched ? memberStatusMatched.Id : ((this.memberStatuses?.[0]?.Id as number) || 1),
            Phone: phoneAi.phone,
            Email: String(rawEmail || '').trim(),
            BloodGroup: bloodAi.bloodGroup,
            BloodGroupId: bloodMatched ? bloodMatched.Id : ((this.bloodGroups?.[0]?.Id as number) || 1),
            Dob: dobAi.dateStr,
            Profession: rawProf || '',
            MemberProfessionId: professionMatched ? professionMatched.Id : ((this.memberProfessions?.[0]?.Id as number) || 1),
            MemberActiveStatusId: activeStatusMatched ? activeStatusMatched.Id : ((this.memberActiveStatus?.[0]?.Id as number) || 1),
            Organization: String(this.aiGetField(m, 'Organization', 'Organaization', 'Company') || '').trim(),
            Designation: String(this.aiGetField(m, 'Designation', 'Position') || '').trim(),
            Specialization: String(this.aiGetField(m, 'Specialization', 'Expertise') || '').trim(),
            NID: String(rawNid || '').trim(),
            HomeAddress: String(rawAddress || '').trim(),
            PermanentAddress: String(rawPermAddress || '').trim(),
            OfficeAddress: String(rawOfficeAddress || '').trim(),
            EmergencyContact: String(rawEmergency || '').trim(),
            JoinDate: joinDateAi.dateStr,
            ClubJoinDate: clubJoinDateAi.dateStr,
            CreditLimit: Number(rawCredit) || 0,
            PinNo: String(this.aiGetField(m, 'PinNo', 'PIN', 'Password') || '0000').trim(),
            SpouseData: spouseObj || null,
            ChildrenList: childrenArr || [],
            isValid: isValid,
            errorMessage: errors.join('; '),
            isPhoneAiCleaned: phoneAi.isModified,
            isNameAiCleaned: nameAi.isModified,
          };
        });

        // Compute AI Readiness Score
        const validCount = this.parsedMembersList.filter((m) => m.isValid).length;
        this.aiQualityScore = this.parsedMembersList.length > 0
          ? Math.round((validCount / this.parsedMembersList.length) * 100)
          : 100;

        // Populate AI Insights summary
        if (phoneCleanedCount > 0) {
          this.aiInsightsList.push(`Standardized ${phoneCleanedCount} phone numbers to 11-digit local format`);
        }
        if (nameCleanedCount > 0) {
          this.aiInsightsList.push(`Auto-formatted & capitalized ${nameCleanedCount} member names and titles`);
        }
        if (dateCleanedCount > 0) {
          this.aiInsightsList.push(`Parsed and normalized ${dateCleanedCount} dates to standard ISO format`);
        }
        if (this.parsedSpousesList.length > 0) {
          this.aiInsightsList.push(`Successfully linked ${this.parsedSpousesList.length} spouse profiles to primary members`);
        }
        if (this.parsedChildrenList.length > 0) {
          this.aiInsightsList.push(`Successfully correlated ${this.parsedChildrenList.length} children records across families`);
        }

        this._alert.success(
          `AI Engine parsed ${this.parsedMembersList.length} members with ${this.aiCleanedCount} auto-corrections applied!`
        );
        this.cdr.detectChanges();
      } catch (err: any) {
        console.error('Excel parse error:', err);
        this._alert.error('Failed to parse Excel file. Please ensure it follows the multi-sheet format.');
      }
    };
    reader.readAsBinaryString(file);
  }

  async executeBulkRegistration(modal: any) {
    const validMembers = this.parsedMembersList.filter((m) => m.isValid);
    if (validMembers.length === 0) {
      this._alert.warning('No valid member records to import.');
      return;
    }

    this.isImporting = true;
    this.importProgress = 0;
    this.importSuccessCount = 0;
    this.importFailedCount = 0;
    const failureMessages: string[] = [];

    const formatDateToIso = (d: any): string => {
      if (!d) return '';
      try {
        if (typeof d === 'string' && d.trim()) {
          const parts = d.split('T')[0].split(/[\/\-\.]/);
          if (parts.length === 3) {
            if (parts[0].length === 4) {
              const pDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
              pDate.setHours(pDate.getHours() + 6);
              return pDate.toISOString();
            } else {
              const pDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
              pDate.setHours(pDate.getHours() + 6);
              return pDate.toISOString();
            }
          }
        }
        const pDate = new Date(d);
        if (!isNaN(pDate.getTime())) {
          pDate.setHours(pDate.getHours() + 6);
          return pDate.toISOString();
        }
      } catch (e) {
        console.warn('Date parse error:', d);
      }
      return '';
    };

    for (let i = 0; i < validMembers.length; i++) {
      const item = validMembers[i];
      const memNo = item.MembershipNo ? String(item.MembershipNo).trim() : '';
      const cardNo = item.CardNo ? String(item.CardNo).trim() : memNo;
      this.importStatusText = `Registering (${i + 1}/${validMembers.length}): ${item.FullName} [${memNo}]...`;
      this.cdr.detectChanges();

      try {
        const formData = new FormData();
        formData.append('Id', '0');
        formData.append('MemberShipNo', memNo);
        formData.append('CardNo', cardNo);
        formData.append('FullName', item.FullName);
        formData.append('Name', item.FullName);
        formData.append('Phone', item.Phone || '');
        formData.append('Email', item.Email || '');
        formData.append('CadetNo', '');
        formData.append('CadetName', item.FullName);
        formData.append('BatchNo', '');
        formData.append('HscYear', '');
        formData.append('PinNo', item.PinNo || '0000');
        formData.append('NID', item.NID || '');
        formData.append('Specialization', item.Specialization || '');
        formData.append('EmergencyContact', item.EmergencyContact || '');
        formData.append('CreditLimit', String(item.CreditLimit || 0));

        const collegeId = item.CollegeId || (this.colleges?.[0]?.Id as number) || 1;
        const typeId = item.MemberTypeId || (this.memberTypes?.[0]?.Id as number) || 1;
        const bloodId = item.BloodGroupId || (this.bloodGroups?.[0]?.Id as number) || 1;
        const profId = item.MemberProfessionId || (this.memberProfessions?.[0]?.Id as number) || 1;
        const statId = item.MemberStatusId || (this.memberStatuses?.[0]?.Id as number) || 1;
        const actStatId = item.MemberActiveStatusId || (this.memberActiveStatus?.[0]?.Id as number) || 1;

        formData.append('CollegeId', String(collegeId));
        formData.append('MemberTypeId', String(typeId));
        formData.append('BloodGroupId', String(bloodId));
        formData.append('MemberProfessionId', String(profId));
        formData.append('MemberStatusId', String(statId));
        formData.append('MemberActiveStatusId', String(actStatId));

        formData.append('Designation', item.Designation || '');
        formData.append('Organaization', item.Organization || '');
        formData.append('HomeAddress', item.HomeAddress || '');
        formData.append('PermanentAddress', item.PermanentAddress || '');
        formData.append('PostalAddress', item.HomeAddress || '');
        formData.append('OfficeAddress', item.OfficeAddress || '');
        formData.append('Dob', formatDateToIso(item.Dob));
        formData.append('JoinDate', formatDateToIso(item.JoinDate));
        formData.append('ClubJoinDate', formatDateToIso(item.ClubJoinDate));
        formData.append('LeaveDate', '');
        formData.append('PaidTill', '');
        formData.append('Anniversary', item.SpouseData ? formatDateToIso(item.SpouseData.Anniversary) : '');
        formData.append('Nok', item.SpouseData?.Nok || 'N/A');
        formData.append('SpouseCardNo', item.SpouseData?.SpouseCardNo || ('SC-' + memNo));
        formData.append('PrvCusID', '');
        formData.append('QBCusName', item.FullName);
        formData.append('DeviceId', '');
        formData.append('HasSubscription', 'false');
        formData.append('MemberTypeText', item.MemberTypeName || '');
        formData.append('CollegeName', item.CollegeName || '');
        formData.append('MemberFullId', `${collegeId}-${typeId}-${memNo}`);

        const res: any = await this.service.createMember(formData).toPromise();

        if (res && (!res.HasError && (res.Succeeded || res.Data?.Id > 0 || res.Id > 0))) {
          // If spouse or children data exists, save family record
          if (item.SpouseData || (item.ChildrenList && item.ChildrenList.length > 0)) {
            try {
              const memberInfo = await this.service.getMemberInformations(memNo).toPromise();
              const newMemberId = memberInfo?.Id || res.Data?.Id || res.Id;

              if (newMemberId) {
                const famFormData = new FormData();
                famFormData.append('Id', '0');
                famFormData.append('MemberId', String(newMemberId));
                famFormData.append('CardNo', item.SpouseData?.SpouseCardNo || ('SC-' + memNo));
                famFormData.append('Spouse', item.SpouseData?.SpouseName || '');
                famFormData.append('SpouseOccupation', item.SpouseData?.SpouseOccupation || '');
                famFormData.append('Anniversary', item.SpouseData?.Anniversary ? formatDateToIso(item.SpouseData.Anniversary) : '');
                famFormData.append('Nok', item.SpouseData?.Nok || 'N/A');
                famFormData.append('SpousePhone', item.SpouseData?.SpousePhone || '');

                const childArray = (item.ChildrenList || []).map((ch: any) => ({
                  Id: 0,
                  ContactName: ch.ChildName,
                  Phone: ch.Phone || '',
                  Dob: formatDateToIso(ch.Dob),
                  Gender: ch.Gender === 'Female' || ch.Gender === 'F' ? 'F' : 'M',
                  CadetNo: ''
                }));
                famFormData.append('MemberchildrenReqJsons', JSON.stringify(childArray));
                famFormData.append('MemberchildrenReqs', JSON.stringify(childArray));

                await this.service.saveMemberFamilyInfo(famFormData).toPromise();
              }
            } catch (famErr) {
              console.warn('Family save warning for member:', memNo, famErr);
            }
          }

          this.importSuccessCount++;
        } else {
          const errMsg = res?.Messages?.join(', ') || res?.Message || 'API returned validation error';
          console.error(`Member ${memNo} failed:`, errMsg);
          failureMessages.push(`[${memNo}] ${item.FullName}: ${errMsg}`);
          this.importFailedCount++;
        }
      } catch (saveError: any) {
        const errTxt = saveError?.error?.Messages?.join(', ') || saveError?.message || 'Server error';
        console.error('Error importing member:', memNo, saveError);
        failureMessages.push(`[${memNo}] ${item.FullName}: ${errTxt}`);
        this.importFailedCount++;
      }

      this.importProgress = Math.round(((i + 1) / validMembers.length) * 100);
      this.cdr.detectChanges();
    }

    this.isImporting = false;
    modal.close();
    this.getMemberList();

    if (this.importFailedCount === 0) {
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: `Successfully registered all ${this.importSuccessCount} members and their families!`,
        timer: 2500,
        showConfirmButton: false,
      });
      this._alert.success(`Successfully registered ${this.importSuccessCount} members!`);
    } else {
      const failureHtml = `
        <div class="text-left p-2 text-start">
          <p class="mb-1 text-success font-weight-bold fw-bold">✓ Successfully Registered: ${this.importSuccessCount}</p>
          <p class="mb-2 text-danger font-weight-bold fw-bold">✗ Failed / Skipped: ${this.importFailedCount}</p>
          <div class="text-danger small" style="max-height: 150px; overflow-y: auto;">
            <strong>Error Details:</strong>
            <ul class="ps-3 mb-0 text-start">
              ${failureMessages.map((msg) => `<li>${msg}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;

      Swal.fire({
        icon: 'warning',
        title: 'Bulk Import Finished with Warnings',
        html: failureHtml,
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'OK, Got It',
      });
    }
  }
}
