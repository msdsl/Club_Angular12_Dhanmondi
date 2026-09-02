import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { CollegeService } from 'src/app/modules/setup/services/college.service';
import { MemberActiveStatusService } from 'src/app/modules/setup/services/member-active-status.service';
import { MemberProfessionService } from 'src/app/modules/setup/services/member-profession.service';
import { MemberTypeService } from 'src/app/modules/setup/services/member-type.service';
import { MemberService } from '../../services/member.service';
import { MemberStatusService } from 'src/app/modules/setup/services/member-status.service';
import { SweetAlertOptions } from 'sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-family-info',
  templateUrl: './family-info.component.html',
  styleUrls: ['./family-info.component.css']
})
export class FamilyInfoComponent implements OnInit {
spin: boolean= false;
  @Input() memberId:any;
  colleges: any;
  hasData
  memberTypes: any;
  memberProfessions: any;
  bloodGroups: any;
  memberActiveStatus: any;
  memberFamilyInfoForm: any;
  memberStatus: any;
  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  memberchildrenArray: any;
  noks=[]
  childInfoForm: any;
  childInfoArray: any = [];

  constructor(
    private service: MemberService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private alertType: AlertTypeService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    
    this.createFilterForm();
    this.createChildInfoForm()
    
    if(this.memberId){
      this.getMemberInfoById(this.memberId)
    }
  }

  getMemberInfoById(memberId){
    this.spin= true;
    this.service.getMemberInfoById(memberId).subscribe(
      (data)=>{
        console.log(data);
         this.setDataToForm(data)
        

        this.noks.push( data?.SpouseData?.FullName)
        data.MemberchildrenReqs.forEach(element => {
          this.noks.push(element.ContactName);
        });

        
        this.cdr.detectChanges()
this.spin= false;
    
      },
      (err)=>{
        console.log(err);
        this.spin= false;
      }
    )
  }

  setDataToForm(data){
    
    
    this.memberFamilyInfoForm.patchValue({
      Id: data.SpouseData.Id,
      MemberId: data.SpouseData.MemberId,
      CardNo: data.SpouseData.CardNo,
      Spouse: data.SpouseData.Spouse,
      SpouseOccupation: data.SpouseData.SpouseOccupation,
      Anniversary: data.SpouseData.Anniversary.toString().substring(0, 10).replace('T', ' '),
      Nok: data.SpouseData.Nok, 
      ImgFileUrl:data.SpouseData.ImgFileUrl
      
    });
    

    this.childInfoArray =  data.MemberchildrenReqs
    this.cdr.detectChanges()
  }

  createFilterForm() {
    this.memberFamilyInfoForm = this.fb.group({
      Id: 0,
      MemberId: "",
      CardNo: ['',Validators.required],
      Spouse: ['',Validators.required],
      SpouseOccupation: ['',Validators.required],
      Anniversary: ['',Validators.required],
      Nok: "N/A", 
      ImgFileUrl:'',
      SpouseFile:'',
      // MemberchildrenReqs: this.fb.array([]),
    });
    // this.memberFamilyInfoForm.get("MemberchildrenReqs") as FormArray;
    // if (!this.memberId) {
    //   this.createDetail();
    // }
    // this.memberchildrenArray = (
    //   this.memberFamilyInfoForm.get("MemberchildrenReqs") as FormArray
    // ).controls;
  }

  createChildInfoForm() {
    this.childInfoForm = this.fb.group({
      Id: 0,
      ContactName: "",
      Phone: "",
      Dob: "",
      Gender: 'M'
    });

  }
  addChild(addChildModal){
    this.childInfoForm.patchValue({
      Id: 0,
      ContactName: "",
      Phone: "",
      Dob: "",
      Gender: 'M'
    });
    this.modalService.open(addChildModal, { size: 'md', centered: true });
  }
  onSubmitChildAddForm(){
    this.childInfoArray.push(this.childInfoForm.value)
    console.log(this.childInfoArray);
    
    
  }
  deleteButtonClick(i){
    this.childInfoArray.splice(i,1)
  }



  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  imageChangeHandler(event: any) {

    const file = event.target.files[0];
    const reader = new FileReader();
    this.memberFamilyInfoForm.get('SpouseFile').patchValue(file);
    reader.onload = (e: any) => {
      this.memberFamilyInfoForm.get('ImgFileUrl').patchValue(e.target.result);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    const inputElement = event.target as HTMLInputElement;
    console.log(this.memberFamilyInfoForm.value);
  }
  removeImage(){
    
    this.memberFamilyInfoForm.get("ImgFileUrl").patchValue(null)
    this.memberFamilyInfoForm.get("SpouseFile").patchValue(null)
    this.cdr.detectChanges()
  }

  prepareToSave() {
    const formData = new FormData();

    formData.append('Id', this.memberFamilyInfoForm.value.Id); 
    formData.append('MemberId', this.memberId); 
    formData.append('CardNo', this.memberFamilyInfoForm.value.CardNo); 
    formData.append('Spouse', this.memberFamilyInfoForm.value.Spouse); 
    formData.append('SpouseOccupation', this.memberFamilyInfoForm.value.SpouseOccupation); 
    formData.append('Anniversary', this.memberFamilyInfoForm.value.Anniversary); 
    formData.append('Nok', this.memberFamilyInfoForm.value.Nok); 
    formData.append('SpouseFile', this.memberFamilyInfoForm.value.SpouseFile);
    formData.append('ImgFileUrl', this.memberFamilyInfoForm.value.ImgFileUrl);
    formData.append("MemberchildrenReqs", JSON.stringify(this.childInfoArray));

    return formData;
  }

  onSubmit(){
    var memberFamilyInfo = this.prepareToSave();

    console.log(this.memberFamilyInfoForm.value);
    this.service.saveMemberFamilyInfo(memberFamilyInfo).subscribe(
      (data)=>{
        console.log(data);
      
        this.showAlert(this.alertType.createSuccessAlert);
      },
      (err)=>{
        this.showAlert(this.alertType.errorAlert);
      }
      
    )
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



}
