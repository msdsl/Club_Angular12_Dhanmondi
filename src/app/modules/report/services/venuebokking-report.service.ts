import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VenuebokkingReportService {
  constructor(private http: HttpClient) {}
  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  getVenueBookingReport(fromDate, toDate, venueId): Observable<Blob> {
    let params = new HttpParams();

    params = params.set('FromDate', fromDate);
    params = params.set('ToDate', toDate);
    params = params.set('VenueId', venueId);

    return this.http.get(
      `${this.APIUrl}VenueBookingReport/GetVenueBookingHistory`,
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
}
