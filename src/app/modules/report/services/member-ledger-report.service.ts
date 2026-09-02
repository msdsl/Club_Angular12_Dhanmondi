import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MemberLedgerReportService {
  constructor(private http: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  getMemberInfoByMemberShipNo(memberShipNo: string) {
    return this.http
      .get<Response>(
        `${this.APIUrl}RegisterMembers/GetByMemberShipNo?memberShipNo=${memberShipNo}`
      )
      .pipe(map((response: any) => response));
  }
  getMemberAttendanceReport(fromDate, toDate, MembershipNo?): Observable<Blob> {
    let params = new HttpParams();

    params = params.set('FromDate', fromDate);
    params = params.set('ToDate', toDate);
    if (fromDate) {
      params = params.set('FromDate', fromDate);
    }
    if (toDate) {
      params = params.set('ToDate', toDate);
    }
    if (MembershipNo) {
      params = params.set('MembershipNo', MembershipNo);
    }

    return this.http.get(
      `${this.APIUrl}MemberReport/GetMemberAttendance`,
      {
        responseType: 'blob',
        params: params,
      }
    );
  }
}
