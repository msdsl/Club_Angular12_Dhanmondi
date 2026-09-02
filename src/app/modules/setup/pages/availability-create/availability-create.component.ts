import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SweetAlertOptions } from 'sweetalert2';
import { AvailabilityService } from '../../services/availability.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-availability-create',
  templateUrl: './availability-create.component.html',
  styleUrls: ['./availability-create.component.css']
})
export class AvailabilityCreateComponent implements OnInit {

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};
  availabilityForm: FormGroup;
  availabilityDetailArray: any=[];
  availabilityId: number;

  constructor(
    private fb: FormBuilder,
    private alertType: AlertTypeService,
    private service: AvailabilityService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    

    this.activateRoute.paramMap.subscribe((params) => {
      this.availabilityId = +params.get('id');
      
      if(this.availabilityId){
        this.getAvailabilityById()
      }
    });
    this.createAvailabilityForm()
  }

  getAvailabilityById(){
    this.service.getById(this.availabilityId).subscribe(
      (data)=>{
        console.log(data);
        
        this.setDataToForm(data.Data);
      },
      (err)=>{
        console.log(err);
        
      }
    )
  }
  setDataToForm(data){

    this.availabilityForm.patchValue({
      Id: data.Id,
      Name: data.Name,
      IsLifeTime: data.IsLifeTime,
      AvailabilityDate: data.AvailabilityDate.toString().substring(0, 10).replace('T', ' '),
    });
    this.setDetailData(data.AvailabilityDetailVms)
    
  }
  setDetailData(data) {
    var i = 0;
    data.forEach((element) => {
      
      this.createDetail();
      this.availabilityDetailArray[i]
        .get("Title")
        .patchValue(element.Title),
        this.availabilityDetailArray[i].get("Id").patchValue(element.Id),
        this.availabilityDetailArray[i]
          .get("StartTime")
          .patchValue(element.StartTime),
        this.availabilityDetailArray[i]
          .get("EndTime")
          .patchValue(element.EndTime),
        this.availabilityDetailArray[i]
          .get("IsChecked")
          .patchValue(element.IsChecked),
        this.availabilityDetailArray[i]
          .get("IsWholeDay")
          .patchValue(element.IsWholeDay),
        this.availabilityDetailArray[i]
          .get("AvailabilityId")
          .patchValue(element.AvailabilityId),
        i++;
    });
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  createAvailabilityForm() {
    this.availabilityForm = this.fb.group({
      Id: 0,
      Name: ['', Validators.required],
      AvailabilityDate: this.formatDate(new Date()),
      AvailabilityEndDate:"",
      IsLifeTime:false,
      AvailabilityDetailVms: this.fb.array([]),
    });

    this.availabilityForm.get("AvailabilityDetailVms") as FormArray;
    if (!this.availabilityId) {
      this.createDetail();
    }
    this.availabilityDetailArray = (
      this.availabilityForm.get("AvailabilityDetailVms") as FormArray
    ).controls;

  //   this.createDetail();
  // this.availabilityDetailArray = (this.availabilityForm.get("AvailabilityDetailVms") as FormArray).controls;
  }

  createDetail() {
    const now = new Date();
    var currentTime = this.datePipe.transform(now, 'HH:mm');
    const newItem = this.fb.group({
      Id: 0,
      Title: "",
      AvailabilityId: 0,
      StartTime: currentTime,
      EndTime: currentTime,
      IsChecked: true,
      IsWholeDay: false,
      SlotQty: '',

    });
    (this.availabilityForm.get("AvailabilityDetailVms") as FormArray).push(newItem);
  }

  addItemDetail(i) {
    

    if (!this.availabilityDetailArray[this.availabilityDetailArray?.length - 1]
      .value.Title) {
      return;
    }

    this.createDetail();
  }

  removeItem(index: number) {
    (this.availabilityForm.get("AvailabilityDetailVms") as FormArray).removeAt(
      index
    );
  }

  onSubmit(){
    console.log(this.availabilityForm.value);
    this.service.createAvailability(this.availabilityForm.value).subscribe(
      (data)=>{
        this.showAlert(this.alertType.createSuccessAlert);
        this.router.navigate(['setups/availability/list']);
      },
      (err)=>{
        this.showAlert(this.alertType.errorAlert);
      }
    )
    
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.alertType.setAlertTypeText('Topup');
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
