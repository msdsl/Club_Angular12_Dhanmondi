import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VenueBlockedService {

  onVenueBookingCreated: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) { }

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;


  createVenueBlocked(serviceSaleObj: any) {
    return this.httpClient.post<any>(
      `${this.APIUrl}Availabilities/SaveVenueBlocked`,
      serviceSaleObj
    );
  }

  getAllVenueBlocked(page?, itemPerPage?, searchKey?, filters?) {
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

    return this.httpClient.get<any>(
      `${this.APIUrl}Availabilities/GetAllVenueBlocked`,
      {
        params,
      }
    );
  }

  getAllVenueBlockedInfo() {
    return this.httpClient.get<any>(`${this.APIUrl}Availabilities/GetAllVenueBlockedInfo`);
  }

  getMemServicesList() {
    return this.httpClient.get<any>(`${this.APIUrl}MemServices/GetAll?pageNo=1&pageSize=150`);
  }
  getVenueAvailableList(selectedDate: string) {
    return this.httpClient.get<any>(
      `${this.APIUrl}MemServices/GetAllVenueWithAvailable?selectedDate=${selectedDate}`
    );
  }

}
