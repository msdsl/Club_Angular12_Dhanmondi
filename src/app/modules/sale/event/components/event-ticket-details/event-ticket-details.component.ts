import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-ticket-details',
  templateUrl: './event-ticket-details.component.html',
  styleUrls: ['./event-ticket-details.component.css']
})
export class EventTicketDetailsComponent implements OnInit {
  eventTicketDetail: any;

  constructor(
    private router: Router
  ) { 
   
    this.eventTicketDetail = this.router.getCurrentNavigation()?.extras.state as any;
    console.log(this.eventTicketDetail);
    
  }


  ngOnInit() {
  }

}
