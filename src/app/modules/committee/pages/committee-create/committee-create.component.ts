import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommitteeService } from '../../services/committee.service';
import { environment } from 'src/environments/environment';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-committee-create',
  templateUrl: './committee-create.component.html',
  styleUrls: ['./committee-create.component.css'],
})
export class CommitteeCreateComponent implements OnInit {
  SubscribedYearList = [
    '2019',
    '2020',
    '2021',
    '2022',
    '2023',
    '2024',
    '2025',
    '2026',
    '2027',
    '2028',
    '2029',
    '2030',
  ];
  executiveMembers: any = [];
  executiveForm: FormGroup;
  member: any;
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};
  executiveId: number;
  CommitteeCategoryList: any;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private service: CommitteeService,
    private alertType: AlertTypeService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.createmanageChargeForm();
    this.getAllCommitteeCategory();

    this.activateRoute.paramMap.subscribe((params) => {
      this.executiveId = +params.get('id');
      if (this.executiveId) {
        this.getExecutiveCommitteeById(this.executiveId);
      }
    });
  }

  getAllCommitteeCategory() {
    this.service.getCommitteeCategoryPagination(1, 1000).subscribe(
      (data) => {
        this.CommitteeCategoryList = data.Data;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getExecutiveCommitteeById(executiveId) {
    this.service.getExecutiveCommitteeById(executiveId).subscribe(
      (data) => {
        this.setDataToForm(data.Data);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  setDataToForm(data) {
    this.executiveForm.patchValue({
      Id: 0,
      CommitteeYear: data.CommitteeYear,
      Title: data.Title,
      CommitteeDate: data.CommitteeDate.toString()
        .substring(0, 10)
        .replace('T', ' '),
      CommitteeType: data.CommitteeType,
      Designation: '',
      CommitteeCategoryId: data.CommitteeCategoryId,
    });

    this.executiveMembers = data.CommitteeDetails;
  }
  createmanageChargeForm() {
    this.executiveForm = this.fb.group({
      Id: 0,
      CommitteeYear: ['', Validators.required],
      Title: null,
      CommitteeDate: null,
      CommitteeType: 'Subexecutive',
      Designation: '',
      CommitteeCategoryId: null,
    });
  }

  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  showMemberInfo(event) {
    this.service.GetCommitteeMembers(event.target.value).subscribe(
      (res) => {
        // this.members = res.DataList;
        console.log(this.member);

        res.DataList.forEach((element) => {
          var executiveMember = {
            Id: 0,
            CommitteeId: 0,
            MemberName: element.FullName,
            Phone: element.Phone,
            Email: element.Email,
            Designation: this.executiveForm.value.Designation,
            MemberShipNo: element.MemberShipNo,
            IsMasterMember: element.IsMasterMember,
            ImgFileUrl: environment.imgUrl + element.ImgFileUrl,
            MemberId: element.Id,
          };

          this.executiveMembers.push(executiveMember);

          // this.cdr.detectChanges();
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  removeExecutiveMember(data) {
    var index = this.executiveMembers.indexOf(data);

    this.executiveMembers.splice(index, 1);
  }

  onSubmit() {
    var executiveForSubmit = this.executiveForm.value;
    executiveForSubmit.CommitteeDetails = this.executiveMembers;

    this.service.createCommittee(executiveForSubmit).subscribe(
      (data) => {
        console.log(data);
        this.showAlert(this.alertType.createSuccessAlert);
        this.router.navigate(['committee/list']);
      },
      (err) => {
        console.log(err);
        this.showAlert(this.alertType.errorAlert);
      }
    );
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Activity');
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
