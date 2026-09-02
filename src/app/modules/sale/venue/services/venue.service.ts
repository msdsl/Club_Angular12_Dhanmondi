import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VenueService {

  onVenueBookingCreated: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;


  createVenueBooking(data): Observable<any> {
    return this.httpClient
      .post<any>(this.APIUrl + 'VenueBookings/Save', data)
      .pipe(catchError(this.handleError));
  }
  saveVenueBookingFamilyInfo(data): Observable<any> {
    return this.httpClient
      .post<any>(this.APIUrl + 'RegisterVenueBookings/FamilySave', data)
      .pipe(catchError(this.handleError));
  }
  getVenuList(bookingDate: string) {
    return this.httpClient.get<any>(`${this.APIUrl}ServiceTickets/GetAllVenues?todayDate=${bookingDate}`);
  }

  getAllAddonList() {
    let pagination = {
      PageNo: 1,
      PageSize: 1000,
      SearchText: '',
    };
    return this.httpClient.post<any>(`${this.APIUrl}AddOnsItems/GetAll`, pagination);
  }
  getTermsAndCandition() {
    return this.httpClient.get<any>(`${this.APIUrl}VenueBookings/GetTramsAndCondition`);
  }

  getVenueBookingFeesList(memberTypeId: number) {
    return this.httpClient.get<any>(`${this.APIUrl}VenueBookingShipFees/GetAll?memberTypeId=${memberTypeId}`);
  }
  saveVenueBookingFeeInfo(feeRes: any) {
    return this.httpClient.post<any>(`${this.APIUrl}RegisterVenueBookings/VenueBookingRegistrationFeeSave`, feeRes);
  }
  getVenueBookingInfoById(Id: number) {
    return this.httpClient
      .get<Response>(`${this.APIUrl}RegisterVenueBookings/GetById?id=${Id}`)
      .pipe(map((response: any) => response.Data));
  }
  getVenueBookingLedgerList(id: string, pageNo: number, pageSize: number) {
    return this.httpClient.get<any>(
      `${this.APIUrl}TopUps/GetVenueBookingLedger?id=${id}&pageNo=${pageNo}&pageSize=${pageSize}`
    );
  }

  saveAdvancedSubPayment(obj: any[], memberId: number) {
    return this.httpClient.post<any>(
      `${this.APIUrl}/api/SubscriptionPayments/SaveAdvancedPayment?memberId=${memberId}`,
      obj
    );
  }

  GetVenueBookingInvoice(id: any): Observable<Blob> {
    return this.httpClient.get(`${this.APIUrl}VenueBookings/GetVenueBookingInvoice?Id=` + id, {
      responseType: 'blob',
    });
  }

  getVenueBookingPagination(page?, itemPerPage?, searchKey?, filters?) {
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

    return this.httpClient
      .get<any>(`${this.APIUrl}VenueBookings/GetAll`, {
        params,
      })
      .pipe(map((response: any) => response));
  }
  dueSaveVenuBooking(dueVenue: any) {
    return this.httpClient.post<any>(`${this.APIUrl}VenueBookings/SaveVenuePayment`, dueVenue);
  }

  getAllBloodGroupData() {
    return this.httpClient.get<any>(
      `${this.APIUrl}Commons/GetAllBloodGroup`
    );
  }
  deleteVenueBooking(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(this.APIUrl + 'VenueBookingCategories/Remove?id=' + id)
      .pipe(catchError(this.handleError));
  }
  bookingInfoByDate(venueId, availabilityId, bookedDate) {
    return this.httpClient
      .get<Response>(
        `${this.APIUrl}VenueBookings/GetBookingInfo?venueId=${venueId}&availabilityId=${availabilityId}&bookedDate=${bookedDate}`
      )
      .pipe(map((response: any) => response.Data));
  }
  cancelVenueBooking(cancelVenueBookingInfo) {
    return this.httpClient.post<Response>(
      `${this.APIUrl}VenueBookings/CancelVenueBooking`,
      cancelVenueBookingInfo
    );
  }

  private handleError(errorResponse: HttpErrorResponse) {
    if (errorResponse.error instanceof ErrorEvent) {
      console.error('Client Side Error: ', errorResponse.error);
    } else {
      console.error('Server Side error', errorResponse);
    }
    return throwError('There is a problem with the service');
  }

}
