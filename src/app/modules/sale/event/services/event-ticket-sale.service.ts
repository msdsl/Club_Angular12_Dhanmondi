import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventTicketSaleService {
  
  onEventCreated: Subject<any> = new Subject<any>();

  constructor(private http: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  getAllEventTicket(page, itemPerPage, searchKey, filters) {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.StartDate) {
        params = params.append('StartDate', filters.StartDate);
      }
      if (filters.EndDate) {
        params = params.append('EndDate', filters.EndDate);
      }
      if (filters.TicketCriteriaId) {
        params = params.append('TicketCriteriaId', filters.TicketCriteriaId);
      }
      if (filters.BookingStatus) {
        params = params.append('BookingStatus', filters.BookingStatus);
      }
     
    }

    if (searchKey != null) {
      params = params.append('PageParams.SearchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageParams.PageNumber', page);
      params = params.append('PageParams.PageSize', itemPerPage);
    }

    return this.http.get<any>(`${this.APIUrl}EventTickets/GetAll`, {
      params,
    });
  }

  getAllEvent() {
    return this.http.get<any>(`${this.APIUrl}ServiceTickets/GetAllEvents`);
  }
  GetEventTicketReportInfo() {
    return this.http.get<any>(`${this.APIUrl}EventTickets/GetEventTicketReportInfo`);
  }

  getAllEventTicketById(Id: number) {
    return this.http.get<any>(`${this.APIUrl}EventTickets/GetById?id=${Id}`);
  }

  getEventTicketInformationById(Id: number) {
    return this.http.get<any>(`${this.APIUrl}EventTickets/GetTicketListById?id=${Id}`);
  }

  getMemberInformations(Id: string) {
    return this.http
      .get<any>(`${this.APIUrl}RegisterMembers/GetByMemberShipNo?memberShipNo=${Id}`)
      .pipe(map((any: any) => any.Data));
  }

  getEventBydate(startDate: string, endDate: string) {
    return this.http.get<any>(
      `${this.APIUrl}ServiceTickets/GetAllEvents?startDate=${startDate}&endDate=${endDate}`
    );
  }
  getEventTicketReport(id: any): Observable<Blob> {
    return this.http.get(`${this.APIUrl}EventTickets/PrintReport?eventSaleId=` + id, {
      responseType: 'blob',
    });
  }
  getMemberEventTicketCount(memberId: number, eventId: number) {
    return this.http.get<any>(
      `${this.APIUrl}EventTickets/GetMemberEventTicketCount?memberId=${memberId}&eventId=${eventId}`
    );
  }

  saveEventTicket(eventTicket: any) {
    return this.http.post<any>(`${this.APIUrl}EventTickets/Save`, eventTicket);
  }
  removeEventTicket(Id: number) {
    return this.http.delete<any>(`${this.APIUrl}EventTickets/Remove?id=${Id}`);
  }

  sendEmailWithAttachment(pdfContent: any, MemberEmail: string) {
    // Prepare the HTTP headers to indicate the request will contain JSON data.
    const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });

    // Prepare the form data.
    const formData = new FormData();
    formData.append('pdfFileModel', pdfBlob, 'attachment.pdf'); // 'attachment.pdf' is the name of the attachment.

    // Add other form data if needed.
    formData.append('MemberEmail', MemberEmail);
    return this.http.post(`${this.APIUrl}EventTickets/SendPdfByEmail`, formData);
  }
  cancelEventTicket(cancelEventTicketInfo) {
    return this.http.post<any>(`${this.APIUrl}EventTickets/CancelEventTicket`, cancelEventTicketInfo);
  }

  sendEventInvoiceEmail(saleEventId: number, memEmail: string) {
    return this.http.get<any>(
      `${this.APIUrl}EventTickets/SendEventInvoiceEmail?saleEventId=${saleEventId}&memEmail=${memEmail}`
    );
  }

  SendPushNotification() {
    return this.http.get<any>(`${this.APIUrl}EventTickets/SendPushNotification`);
  }

}
