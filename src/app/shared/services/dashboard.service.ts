import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private get APIUrl(): string {
    const win = window as any;
    if (win.__env && win.__env.apiUrl) {
      return win.__env.apiUrl;
    }
    return environment.apiUrl;
  }

  constructor(private http: HttpClient) {}

  /**
   * 1. Get Dashboard Summary Overview (KPIs, Growth rates, Dept Revenues, Today Summaries, etc.)
   */
  GetDashboardAllData(): Observable<any> {
    return this.http.get<any>(`${this.APIUrl}Dashboard/GetDashboardAllData`);
  }

  /**
   * 2. Get Yearly/Periodic Income Data (For Area/Spline Chart)
   */
  getYearlyIncomeData(filter?: string): Observable<any> {
    let params = new HttpParams();
    if (filter) {
      params = params.set('filter', filter);
    }
    return this.http.get<any>(`${this.APIUrl}Dashboard/GetYearlyIncomeData`, { params });
  }

  /**
   * 3. Get Active User Login/Conference Data
   */
  GetUserConferenceData(pageNo: number, pageSize: number): Observable<any> {
    return this.http.get<any>(
      `${this.APIUrl}Dashboard/GetUserConferenceData?PageNo=${pageNo}&PageSize=${pageSize}`
    );
  }

  /**
   * 4. Get Event Ticket Sales Report Data
   */
  getEventSaleData(): Observable<any> {
    return this.http.get<any>(`${this.APIUrl}Dashboard/GetEventTicketSaleInfo`);
  }

  /**
   * 5. Get Daily Member Attendance Data
   */
  getDailyAttendance(toDayDate: string): Observable<any> {
    let params = new HttpParams();
    params = params.set('FromDate', toDayDate);
    params = params.set('ToDate', toDayDate);
    return this.http.get<any>(`${this.APIUrl}Attendancens/DailyAttendance`, { params });
  }

  /**
   * 6. Get All Transaction Data for Department Sales & Today Summary
   */
  getAllTransactionData(startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams();
    params = params.set('startDate', startDate);
    params = params.set('endDate', endDate);
    return this.http.get<any>(`${this.APIUrl}Dashboard/GetAllTransactionData`, { params });
  }

  /**
   * 7. Get Venue Bookings List
   */
  getVenueBookingPagination(page: number = 1, itemPerPage: number = 20, searchKey: string = '', filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      if (filters.StartDate) params = params.append('StartDate', filters.StartDate);
      if (filters.EndDate) params = params.append('EndDate', filters.EndDate);
      if (filters.BookingStatus) params = params.append('BookingStatus', filters.BookingStatus);
    }
    if (searchKey) params = params.append('PageParams.SearchKey', searchKey);
    params = params.append('PageParams.PageNumber', page.toString());
    params = params.append('PageParams.PageSize', itemPerPage.toString());

    return this.http.get<any>(`${this.APIUrl}VenueBookings/GetAll`, { params });
  }

  /**
   * 8. Get User Navigation / Permissions
   */
  getNavMenus(userId: string): Observable<any> {
    return this.http.get<any>(`${this.APIUrl}Users/GetNavMenus?userId=${userId}`);
  }
}
