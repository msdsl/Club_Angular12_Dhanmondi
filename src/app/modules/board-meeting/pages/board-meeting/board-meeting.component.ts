import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BoardMettingService } from '../../services/board-metting.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SweetAlertOptions } from 'sweetalert2';

@Component({
  selector: 'app-board-meeting',
  standalone: false,
  templateUrl: './board-meeting.component.html',
  styleUrl: './board-meeting.component.scss',
})
export class BoardMeetingComponent implements OnInit {
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
  dataList: any[] = [];
  editId: any;
  swalOptions: SweetAlertOptions = {};
  entrieCountList: any[] = [5, 10, 15, 25, 50, 100];
  isFilter = false;
  isOpenAction: number | null = null;
  shouldDropUp: boolean = false;
  boardMeetingForm: FormGroup;
  isForDeleteId: number;
  List: any;
  committeeList: any[] = [];
  fileUrl: any;
  fileDatalist = new FormData();
  fileName: any;
  fileType: any;
  constructor(
    private _service: BoardMettingService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alert: ToastrService,
    private alertType: AlertTypeService
  ) {}

  ngOnInit() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.numberOfEntries = 0;
    this.getCommittee();
    this.getList();
    this.createFilterForm();
    this.createForm();
  }

  createForm() {
    this.boardMeetingForm = this.fb.group({
      Id: 0,
      Title: ['', Validators.required],
      MeetingDate: ['', Validators.required],
      SubDirectory: '',
      Note: [''],
      file: null,
      CommitteeId: null,
      CommitteeTitle: null,
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
      searchKey: null,
    });
  }

  setNumberOfTableEntries(event: any) {
    this.pageSize = +event.target.value;
    this.getList();
  }

  onCancelButtonClick() {
    document.getElementById('close-button').click();
  }

  getList() {
    this.spin = true;
    this._service
      .getPagination(this.currentPage, this.pageSize, this.searchKey)
      .subscribe(
        (data) => {
          this.dataList = data.Data;
          this.hasData = this.dataList?.length > 0;
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
    this.getList();
  }

  careateOrEditModalPopUp(createOrUpdateModal, data?) {
    if (data?.Id > 0) {
      this.boardMeetingForm.patchValue({
        Id: data.Id,
        Title: data.Title,
        MeetingDate: data.MeetingDate,
        Note: data.Note,
        CommitteeId: data.CommitteeId,
        CommitteeTitle: data.CommitteeTitle,
      });
      this.fileName = data.FileName;
      this.fileUrl = data.FileUrl;
    } else {
      this.boardMeetingForm.reset();
      this.boardMeetingForm.get('Id').patchValue(0);
    }
    this.modalService.open(createOrUpdateModal, { size: 'lg' });
  }

  reloadData() {
    this.currentPage = 1;
    this.getList();
  }

  getRegionListByCriteria(event) {
    this.pageSize = Number(event.pageSize);
    this.searchKey = event.searchKey;
    this.getList();
  }

  onCancelPopUp() {
    document.getElementById('close-button').click();
  }

  filterModalPopUp(advanceFilterModal) {
    this.modalService.open(advanceFilterModal, { size: 'lg' });
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.fileName = file.name;
    this.fileType = file.type;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fileUrl = e.target.result;
    };
    reader.readAsDataURL(file);
    const inputElement = event.target as HTMLInputElement;
    this.uploadFile(inputElement.files as any);
  }
  uploadFile(files: File[]): void {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    this.fileDatalist = formData;
  }
  onSubmit() {
    if (!this.boardMeetingForm.valid) {
      this._alert.error('Please provide valid information');
      return;
    }
    this.fileDatalist.append('Title', this.boardMeetingForm.value.Title);
    this.fileDatalist.append(
      'MeetingDate',
      this.boardMeetingForm.value.MeetingDate
    );
    this.fileDatalist.append('SubDirectory', 'BoardMeeting');
    this.fileDatalist.append('Note', this.boardMeetingForm.value.Note);

    const item = this.committeeList.find(
      (x) => (x.CommitteeId = this.boardMeetingForm.value.CommitteeId)
    );

    this.fileDatalist.append(
      'CommitteeId',
      this.boardMeetingForm.value.CommitteeId
    );
    this.fileDatalist.append('CommitteeTitle', item?.CommitteeTitle!);

    this._service.create(this.fileDatalist).subscribe(
      (data) => {
        console.log(data);
        if (data.HasError) {
          this.showAlert(this.alertType.errorAlert);
        } else {
          this.getList();
          this.boardMeetingForm.value.Id
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
  getCommittee() {
    this.spin = true;
    this._service.getAllCommitee().subscribe(
      (data) => {
        this.committeeList = data.Data;
        this.cdr.detectChanges();
        this.spin = false;
      },
      (err) => {
        this.spin = false;
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
  triggerDelete() {
    this._service.delete(this.isForDeleteId).subscribe(
      (data) => {
        this.showAlert(this.alertType.deleteSuccessAlert);
        this.getList();
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
    this.getList();
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Area status');
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
