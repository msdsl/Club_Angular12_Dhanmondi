import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventTicketReportService {
  constructor(private http: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  getEventTicketReport(fromDate, toDate, eventId): Observable<Blob> {
    let params = new HttpParams();

    if (fromDate != null && fromDate !== '') params = params.set('FromDate', fromDate);
    if (toDate != null && toDate !== '') params = params.set('ToDate', toDate);
    if (eventId != null && eventId !== '') params = params.set('EventId', eventId);

    return this.http.get(
      `${this.APIUrl}TicketReport/EventTicketReport`,
      {
        responseType: 'blob',
        params: params,
      }
    );
  }

  getMemServicesList(page?, itemPerPage?, searchKey?) {
    let params = new HttpParams();

    if (searchKey != null) {
      params = params.append('PageParams.SearchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageParams.PageNumber', 1);
      params = params.append('PageParams.PageSize', 1000);
    }

    return this.http
      .get<any>(`${this.APIUrl}MemServices/GetAll`, {
        params,
      })
      .pipe(map((response: any) => response));
  }
  getEventTicketSaleReport(eventId, membershipNo): Observable<Blob> {
    let params = new HttpParams();
    if (eventId != null && eventId !== '') params = params.set('EventId', eventId);
    if (membershipNo != null && membershipNo !== '') params = params.set('MembershipNo', membershipNo);

    return this.http.get(
      `${this.APIUrl}EventTicketSaleReport/EventTicketSaleReport`,
      {
        responseType: 'blob',
        params: params
      }
    );
  }
}
