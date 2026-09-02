import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core';
import multiMonthPlugin from '@fullcalendar/multimonth';

import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VenueBlockedService } from '../../services/venue-blocked.service';
import { AlertService } from 'src/app/@shared/AlertService';
import { DateConverter } from 'src/app/_metronic/kt/_utils/DateConverter';
import { NewVenueBlockedModalComponent } from '../../components/new-venue-blocked-modal/new-venue-blocked-modal.component';

@Component({
  selector: 'app-venue-blocked-create',
  templateUrl: './venue-blocked-create.component.html',
  styleUrls: ['./venue-blocked-create.component.css']
})
export class VenueBlockedCreateComponent implements OnInit {
  isLoading = false;
  venueList: any[] = [];
  Events: any[] = [];
  titleText = '';
  collectionSize = 0;
  page = 1;
  limit = 10;
  skip = 1;
  venueBlockedDateList: any;
  isInsertMode = false;
  filterForm: FormGroup;
  insertForm: FormGroup;
  dayNameList = [];
  showDate = false;
  showDayName = false;
  ismonth = false;
  isyaer = false;
  selectedDates: Date[] = [];

  currentEvents: EventApi[] = [];
  calendarOptions: CalendarOptions;

  constructor(
    private service: VenueBlockedService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private _modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.createFilterForm();
    this.getAll(1);
    this.getAllVenus();
    this.initCalendar();
  }
  loadEvents(info, successCallback, failureCallback) {
    this.service.getAllVenueBlockedInfo().subscribe(
      (res) => {
        if (!res.HasError) {
          
          var blockedDateList = res.DataList;
          const transformedEvents = blockedDateList.map((x: any) => {
            return {
              title: x.VenueTitle+' ('+x.AvailablilityDetailTitle+')',
              start: x.SelectedDate,
              end: x.SelectedDate,
              color: '#ff5733',
              
            };
          });

          successCallback(transformedEvents);
        }
      },
      (error) => {
        console.error('Error fetching events:', error);
        failureCallback(error);
      }
    );
  }

  
  initCalendar() {
    this.calendarOptions = {
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, multiMonthPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: '',
      },
      initialView: 'multiMonthFourMonth',
      views: {
        multiMonthFourMonth: {
          type: 'multiMonth',
          duration: { months: 12 },
        },
      },
      customButtons: {
        myCustomButton: {
          text: 'custom!',
          click: function () {
            alert('clicked the custom button!');
          },
        },
      },
      // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      events: this.loadEvents.bind(this),
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this),
      
     
      /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
    };
  }

  // calendarVisible$ = this.store.select(CalendarFeature.selectCalendarVisible);
  // events$ = this.venueBlockedDateList.select(CalendarFeature.selectEvents);
  // eventsCount$ = this.store.select(selectEventsCount);

  handleDateSelect(selectInfo: DateSelectArg) {
    
    console.log(selectInfo);
    const modalRef = this._modalService.open(NewVenueBlockedModalComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.dateInfo = selectInfo;
    modalRef.componentInstance.eventSaved.subscribe(() => {
      this.refreshCalendar();
    });
  }
  refreshCalendar() {
    this.initCalendar();
  }
  handleDateClick(event: any) {
    console.log(event);
    return;

    const selectedDate = event.date;
    this.selectedDates.push(selectedDate);

    // Log the selected dates to the console (you can remove this in production)
    console.log('Selected Dates:', this.selectedDates);
  }
  handleEventClick(clickInfo: EventClickArg) {
    if (this.selectedDates.some((date) => date.toISOString() === clickInfo.event.start.toISOString())) {
      clickInfo.el.style.backgroundColor = 'blue'; // Set the background color for selected events
      clickInfo.el.style.color = 'white'; // Set the text color for selected events
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    this.changeDetector.detectChanges();
    //  if (this.selectedDates.some((date) => date.toISOString() === events.every.toISOString())) {
    //    clickInfo.el.style.backgroundColor = 'blue'; // Set the background color for selected events
    //    clickInfo.el.style.color = 'white'; // Set the text color for selected events
    //  }
  }

  createFilterForm() {
    this.filterForm = this.formBuilder.group({
      fromDate: null,
      toDate: null,
    });
  }

  createNew() {
    this.isInsertMode = true;
    this.titleText = 'Venue Blocked Setup';
    this.dayNameList = this.getAllDayNames();
    this.insertForm = this.formBuilder.group({
      BlockedDate: null,
      IsThisMonth: false,
      IsThisYear: false,
      DayName: '',
    });
  }
  dateWise(x: number) {
    if (x === 1) {
      this.showDate = true;
      this.showDayName = false;
    }
    if (x === 2) {
      this.showDate = false;
      this.showDayName = true;
      this.ismonth = true;
    }
    if (x === 3) {
      this.showDate = false;
      this.showDayName = true;
      this.isyaer = true;
    }
  }

  getAll(page: number) {
    this.titleText = 'Venue Blocked Date List';
    this.isInsertMode = false;
    const formValues = this.filterForm.value;
    let fromDateValue = null;
    let toDateValue = null;

    if (this.filterForm.value.fromDate) {
      fromDateValue = new DateConverter().dateModal(formValues.fromDate);
    }
    if (this.filterForm.value.toDate) {
      toDateValue = new DateConverter().dateModal(formValues.toDate);
    }
    this.isLoading = true;
    this.service.getAllVenueBlocked(page, this.limit, fromDateValue, toDateValue).subscribe(
      (res) => {
        if (!res.HasError) {
          this.venueBlockedDateList = res.DataList;
          this.collectionSize = res.DataCount;
        }
        this.isLoading = false;
      },
      (error: any) => {
        error.Messages.forEach((element: any) => {
          this.alertService.error(element);
        });
        this.isLoading = false;
      }
    );
  }
  saveCommand() {
    if (this.ismonth) {
      this.insertForm.value.IsThisMonth = true;
    }
    if (this.isyaer) {
      this.insertForm.value.IsThisYear = true;
    }
    if (this.insertForm.value.BlockedDate != null) {
      let blockedDate = new DateConverter().dateModal(this.insertForm.value.BlockedDate);
      this.insertForm.value.BlockedDate = blockedDate;
    }

    this.service.createVenueBlocked(this.insertForm.value).subscribe((res) => {
      if (res.HasError) {
        res.Messages.forEach((element) => {
          this.alertService.error(element);
        });
      } else {
        res.Messages.forEach((element) => {
          this.alertService.success(element);
        });
      }
    });
  }

  getAllDayNames(): string[] {
    const dayNames: string[] = [];
    dayNames.push('Sunday');
    dayNames.push('Monday');
    dayNames.push('Tuesday');
    dayNames.push('Wednesday');
    dayNames.push('Thursday');
    dayNames.push('Friday');
    dayNames.push('Saturday');
    return dayNames;
  }

  getAllVenus() {
    this.service.getMemServicesList().subscribe((res) => {
      if (!res.HasError) {
        this.venueList = res.DataList;
      } else if (res.HasError) {
        res.Messages.forEach((element: string) => {
          this.alertService.error(element);
        });
      }
      (error: any) => {
        error.Messages.forEach((element: string) => {
          this.alertService.error(element);
        });
      };
    });
  }

  openModal(modal: any) {
    this._modalService.open(modal);
  }
}
