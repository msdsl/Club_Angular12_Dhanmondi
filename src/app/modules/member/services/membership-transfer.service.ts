import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MembershipTransferService {
  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  createMembershipTransfer(data): Observable<any> {
    return this.httpClient
      .post<any>(this.APIUrl + 'Members/CreateMemberTransfer', data)
      .pipe(catchError(this.handleError));
  }

  getMembershipTransferHist() {
    let params = new HttpParams();

    return this.httpClient
      .get<any>(`${this.APIUrl}Members/GetMembershipTransferHist`, {
        params,
      })
      .pipe(map((response: any) => response));
  }
  getMemberInfoByMembershipNo(membershipNo: string) {
    let params = new HttpParams().set('MembershipNo', membershipNo);

    return this.httpClient
      .get<any>(`${this.APIUrl}Members/GetMemberInfoByMembershipNo`, {
        params,
      })
      .pipe(map((response: any) => response));
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
