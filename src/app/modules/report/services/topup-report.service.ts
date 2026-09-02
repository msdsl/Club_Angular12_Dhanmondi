import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TopupReportService {
  constructor(private http: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  getTopUpDetailReport(fromDate, toDate, memberId): Observable<Blob> {
    let params = new HttpParams();

    params = params.set('FromDate', fromDate);
    params = params.set('ToDate', toDate);
    params = params.set('MembershipNo', memberId);

    return this.http.get(`${this.APIUrl}TopUps/ExportTopUpReport`, {
      responseType: 'blob',
      params: params,
    });
  }
  getTopUpSummaryReport(
    fromDate,
    toDate,
    memberId,
    userName
  ): Observable<Blob> {
    let params = new HttpParams();

    if (fromDate) {
      params = params.set('FromDate', fromDate);
    }
    if (toDate) {
      params = params.set('ToDate', toDate);
    }
    if (memberId) {
      params = params.set('MembershipNo', memberId);
    }
    if (userName) {
      params = params.set('UserName', userName);
    }

    return this.http.get(
      `${this.APIUrl}TopUps/ExportTopUpSummaryReport`,
      {
        responseType: 'blob',
        params: params,
      }
    );
  }

  getAllUsers(
    pageNo: number,
    pageSize: number,
    appId?: string,
    searchText?: string
  ) {
    let params = new HttpParams();

    if (searchText != null) {
      params = params.append('SearchKey', searchText);
    }

    if (pageNo != null && pageSize != null) {
      params = params.append('PageNumber', pageNo);
      params = params.append('PageSize', pageSize);
      params = params.append('AppId', appId);
    }

    return this.http
      .get<any>(`${this.APIUrl}Users/GetAllUsers`, {
        params,
      })
      .pipe(map((response: any) => response));
  }
}
