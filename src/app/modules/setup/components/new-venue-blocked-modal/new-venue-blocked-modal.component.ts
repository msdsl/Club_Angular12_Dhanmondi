import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VenueBlockedService } from '../../services/venue-blocked.service';
import { AlertService } from 'src/app/@shared/AlertService';

@Component({
  selector: 'app-new-venue-blocked-modal',
  templateUrl: './new-venue-blocked-modal.component.html',
  styleUrls: ['./new-venue-blocked-modal.component.scss'],
})
export class NewVenueBlockedModalComponent implements OnInit {
  @Output() eventSaved = new EventEmitter();
  @Input() dateInfo: any;
  insertForm: FormGroup;
  venueList: any[] = [];
  venueBlockedReq:any={}
  selectedDate: '';

  //for venu all check and it's availability
  isAllVenuChecked = false;

  constructor(
    public activeModal: NgbActiveModal,
    private service: VenueBlockedService,
    private _alertService: AlertService,
    private formBuilder: FormBuilder
  ) {}

  createNew() {
    this.selectedDate = this.dateInfo.startStr;
    this.insertForm = this.formBuilder.group({
      VenueTitle: '',
      IsThisMonth: false,
      IsThisYear: false,
      DayName: '',
      VenueId: 0,
    });
  }
  closeModal() {
    this.activeModal.close();
  }

  saveEvent() {
    this.venueBlockedReq.BlockedDate = this.dateInfo.startStr;
    this.venueBlockedReq.VenueId = this.insertForm.value.VenueId;
    //  this.venueBlockedReq.VenueTitle = this.venueList.find((x) => x.Id === this.insertForm.value.VenueId).Title;
    console.log(this.venueBlockedReq);
    //  return;

    this.service.createVenueBlocked(this.venueList).subscribe((res) => {
      if (res.HasError) {
        res.Messages.forEach((element) => {
          this._alertService.error(element);
        });
      } else {
        res.Messages.forEach((element) => {
          this.eventSaved.emit();
          this.closeModal();
          this._alertService.success(element);
        });
      }
    });
  }
  ngOnInit(): void {
    this.createNew();
    this.getAllVenus();
  }

  getAllVenus() {
    this.service.getVenueAvailableList(this.dateInfo.startStr).subscribe((res) => {
      if (!res.HasError) {
        this.venueList = res.DataList;
        //   this.venueList = this.venueList.filter((x) => x.ServiceTypeTitle === 'Venue');
      } else if (res.HasError) {
        res.Messages.forEach((element: string) => {
          this._alertService.error(element);
        });
      }
      (error: any) => {
        error.Messages.forEach((element: string) => {
          this._alertService.error(element);
        });
      };
    });
  }

  handleAllVenueSelect() {
    if (this.isAllVenuChecked) {
      this.venueList.forEach((x) => {
        (x.IsChecked = true), x.VenueAvailableDetails.forEach((x1) => (x1.IsChecked = true));
      });
    } else {
      this.venueList.forEach((x) => {
        (x.IsChecked = false), x.VenueAvailableDetails.forEach((x1) => (x1.IsChecked = false));
      });
    }
  }
  handleVenueSelect(xdata: any) {
    this.venueList.forEach((x) => {
      if (x.VenueId === xdata.VenueId && x.IsChecked) {
        x.VenueAvailableDetails.forEach((x1) => {
          if (x1.VenueId === x.VenueId) {
            x1.IsChecked = x.IsChecked;
          }
        });
      }
    });
  }
  handleVenueAvailableSelect(xdata: any) {
    this.venueList.forEach((x) => {
      if (x.VenueId === xdata.VenueId && xdata.IsChecked) {
        x.IsChecked = true;
      } else {
        x.IsChecked = x.IsChecked;
      }
    });

    // this.venueList.forEach((x) => {
    //   x.VenueAvailableDetails.forEach((x1) => {
    //     if (x1.VenueId === xdata.VenueId) {
    //       x.IsChecked = true;
    //     }
    //   });
    // });
  }
}
