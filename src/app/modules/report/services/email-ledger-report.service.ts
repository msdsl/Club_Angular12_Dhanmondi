import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailLedgerReportService {
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
  getMemberLedgerDetailReport(fromDate, toDate, memberNo?): Observable<Blob> {
    let params = new HttpParams();

    params = params.set('FromDate', fromDate);
    params = params.set('ToDate', toDate);
    params = params.set('MembershipNo', memberNo);

    return this.http.get(`${this.APIUrl}MemberReport/GetMemberLedgerDetail`, {
      responseType: 'blob',
      params: params,
    });
  }
  // member-ledger.service.ts

  downloadLedgerSummaryExcel(fromDate, toDate, memberNo?): Observable<Blob> {
    let params = new HttpParams();

    params = params.set('FromDate', fromDate);
    params = params.set('ToDate', toDate);
    params = params.set('MembershipNo', memberNo);
    return this.http.get(
      `${this.APIUrl}MemberReport/GetMemberLedgerSummaryExcel`,
      {
        params,
        responseType: 'blob', // 👈 important
      }
    );
  }

  getMemberLedgerSummaryReport(fromDate, toDate, memberNo?): Observable<Blob> {
    let params = new HttpParams();

    params = params.set('FromDate', fromDate);
    params = params.set('ToDate', toDate);
    params = params.set('MembershipNo', memberNo);

    return this.http.get(`${this.APIUrl}MemberReport/GetMemberLedgerSummary`, {
      responseType: 'blob',
      params: params,
    });
  }
  sendMail(fromDate, toDate, memberNo) {
    var obj = {
      FromDate: fromDate,
      ToDate: toDate,
      MembershipNo: memberNo,
    };

    return this.http.post<Response>(
      `${this.APIUrl}RegisterMembers/SendMail`,
      obj
    );
  }
}
