import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/@shared/AlertService';
import { EmailService } from '../email.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-custom-email',
  standalone: false,
  templateUrl: './custom-email.component.html',
  styleUrl: './custom-email.component.scss',
})
export class CustomEmailComponent implements OnInit {
  emailForm: FormGroup;
  files: File[] = [];

  constructor(
    private fb: FormBuilder,
    private _EmailService: EmailService,
    private _alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.emailForm = this.fb.group({
      subject: [null, Validators.required],
      body: [null, Validators.required],
      emailList: this.fb.array([]),
      attachments: [null],
    });
  }

  get emailList(): FormArray {
    return this.emailForm.get('emailList') as FormArray;
  }

  addEmailField(email: string = '') {
    this.emailList.push(
      this.fb.control(email, [Validators.required, Validators.email])
    );
  }

  removeEmailField(index: number) {
    this.emailList.removeAt(index);
  }

  onExcelUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.emailList.clear(); // Clear existing email list

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const binaryData = e.target.result;
      const workbook = XLSX.read(binaryData, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });

      sheetData.forEach((row: any) => {
        const email = row[0];
        if (
          email &&
          this.validateEmail(email) &&
          !this.emailList.controls.some((ctrl) => ctrl.value === email)
        ) {
          this.addEmailField(email);
        }
      });
    };

    reader.onerror = () => {
      this._alertService.error('Failed to read Excel file.');
    };

    reader.readAsBinaryString(file);
  }

  onFileChange(event: any) {
    this.files = Array.from(event.target.files);
  }

  validateEmail(email: string): boolean {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  }

  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }

  onSubmit() {
    if (this.emailForm.invalid || this.emailList.length === 0) {
      this._alertService.error('Please complete all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('EmailSubject', this.emailForm.get('subject')?.value);
    formData.append('Message', this.emailForm.get('body')?.value);

    this.emailList.controls.forEach((control) => {
      formData.append('EmailList', control.value);
    });

    this.files.forEach((file) => {
      formData.append('Attachments', file);
    });

    Swal.fire({
      text: 'Are you sure you want to send custom Email?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4255b5',
      cancelButtonColor: '#333',
      width: '20rem',
      confirmButtonText: 'Send',
    }).then((result) => {
      if (result.isConfirmed) {
        this._EmailService.sendCustomEmailByExcel(formData).subscribe({
          next: (res) => {
            this._alertService.success('Message sent successfully');
            this.emailForm.reset();
            this.emailList.clear();
            this.files = [];
          },
          error: () => {
            this._alertService.error('Failed to send email');
          },
        });
      }
    });
  }
}
