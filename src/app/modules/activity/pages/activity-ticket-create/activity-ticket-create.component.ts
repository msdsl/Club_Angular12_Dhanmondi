import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-activity-ticket-create',
  templateUrl: './activity-ticket-create.component.html',
  styleUrls: ['./activity-ticket-create.component.css']
})
export class ActivityTicketCreateComponent implements OnInit {

  ticketId: number;
  ticketTypeId: number;
  selectedTab: any = 1;

  constructor(
    private activateRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    
    this.activateRoute.paramMap.subscribe((params) => {
      
      this.ticketTypeId = +params.get('ticketTypeId');
      this.ticketId = +params.get('id');
      

      if(this.ticketTypeId == 1){
        this.selectedTab = 1;
      }
      if(this.ticketTypeId == 6){
        this.selectedTab = 2;
      }
      if(this.ticketTypeId == 7){
        this.selectedTab = 3;
      }
      this.cdr.detectChanges()
    });
  }

  selectTab(tab){
    this.selectedTab = tab;
  }

}
