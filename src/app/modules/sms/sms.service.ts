import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SmsService {
  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  sendBulkSms(smsObj: any) {
    return this.httpClient.post<Response>(
      `${this.APIUrl}Commons/SendBulkSms`,
      smsObj
    );
  }
  getAllSMSMemberInfo(memberSearchReq: any) {
    return this.httpClient.post<any>(
      `${this.APIUrl}RegisterMembers/GetAllMemberPhoneNo`,
      memberSearchReq
    );
  }
  getMemberActiveStatusPagination(page?, itemPerPage?, searchKey?) {
    let params = new HttpParams();

    if (searchKey != null) {
      params = params.append('PageParams.SearchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageParams.PageNumber', page);
      params = params.append('PageParams.PageSize', itemPerPage);
    }

    return this.httpClient
      .get<any>(`${this.APIUrl}MemberActiveStatuss/GetAll`, {
        params,
      })
      .pipe(map((response: any) => response));
  }
  getCollegePagination(page?, itemPerPage?, searchKey?) {
    let params = new HttpParams();
    if (searchKey != null) {
      params = params.append('SearchKey', searchKey);
    }
    if (page != null && itemPerPage != null) {
      params = params.append('PageNo', page);
      params = params.append('PageSize', itemPerPage);
    }
    return this.httpClient
      .get<any>(`${this.APIUrl}Colleges/GetAll`, {
        params,
      })
      .pipe(map((response: any) => response));
  }
  getAllBloodGroupData() {
    return this.httpClient.get<any>(`${this.APIUrl}Commons/GetAllBloodGroup`);
  }
  getMemberTypePagination(page?, itemPerPage?, searchKey?) {
    let params = new HttpParams();
    if (searchKey != null) {
      params = params.append('PageParams.SearchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageParams.PageNumber', page);
      params = params.append('PageParams.PageSize', itemPerPage);
    }

    return this.httpClient
      .get<any>(`${this.APIUrl}MemberTypes/GetAll`, {
        params,
      })
      .pipe(map((response: any) => response));
  }
  getMemberProfessionPagination(page?, itemPerPage?, searchKey?) {
    let params = new HttpParams();

    if (searchKey != null) {
      params = params.append('PageParams.SearchKey', searchKey);
    }
    if (page != null && itemPerPage != null) {
      params = params.append('PageParams.PageNumber', page);
      params = params.append('PageParams.PageSize', itemPerPage);
    }
    return this.httpClient
      .get<any>(`${this.APIUrl}MemberProfessions/GetAll`, {
        params,
      })
      .pipe(map((response: any) => response));
  }
  getAllSendSMSLogList(page?, itemPerPage?, searchKey?) {
    let params = new HttpParams();

    if (searchKey != null) {
      params = params.append('SearchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageNo', page);
      params = params.append('PageSize', itemPerPage);
    }

    return this.httpClient
      .get<any>(`${this.APIUrl}Commons/GetSmsLog`, {
        params,
      })
      .pipe(map((response: any) => response));
  }

  sendCustomSMS(data): Observable<any> {
    return this.httpClient
      .post<any>(this.APIUrl + 'Commons/SendSms', data)
      .pipe(catchError(this.handleError));
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
