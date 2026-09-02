import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { SmsService } from '../sms.service';

@Component({
  selector: 'app-custom-sms',
  standalone: false,
  templateUrl: './custom-sms.component.html',
  styleUrl: './custom-sms.component.scss',
})
export class CustomSmsComponent implements OnInit {
  customSmsForm: FormGroup;
  constructor(
    private _fb: FormBuilder,
    private _alert: ToastrService,
    private _service: SmsService
  ) {}
  ngOnInit(): void {
    this.createForm();
  }
  createForm() {
    this.customSmsForm = this._fb.group({
      Id: 0,
      PhoneNo: ['', Validators.required],
      Message: [''],
    });
  }
  handleBlur(forControl) {
    return forControl.valid || forControl.untouched;
  }
  onSubmit() {
    if (!this.customSmsForm.valid) {
      return this._alert.error('Message body is required');
    }

    const body = this.customSmsForm.value;
    body.LanType = 'English';

    Swal.fire({
      text: 'Are you sure you want to send bulk SMS?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4255b5',
      cancelButtonColor: '#333',
      width: '20rem',
      confirmButtonText: 'Send',
    }).then((result) => {
      if (result.isConfirmed) {
        this._service.sendCustomSMS(body).subscribe({
          next: (res: any) => {
            this._alert.success('Bulk SMS sent successfully');
            this.customSmsForm.reset();
          },
          error: (error: any) => {
            if (error?.Messages) {
              error.Messages.forEach((msg: any) => {
                this._alert.error(msg);
              });
            }
          },
        });
      }
    });
  }
}
