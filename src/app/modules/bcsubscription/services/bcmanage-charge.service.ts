import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, Observable, catchError, map, throwError } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/models/pagination.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BcmanageChargeService {
  onManageChargeCreated: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  createManageCharge(obj): Observable<any> {
    return this.httpClient.post<Response>(
      `${this.APIUrl}SubscriptionFees/SaveYearly`,
      obj
    );
  }

  deleteManageCharge(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(this.APIUrl + 'SubscriptionFees/Remove?id=' + id)
      .pipe(catchError(this.handleError));
  }

  getManageChargePagination(page?, itemPerPage?, searchKey?) {
    const paginatedResult: PaginatedResult<any[]> = new PaginatedResult<
      any[]
    >();

    let params = new HttpParams();

    if (searchKey != null) {
      params = params.append('PageParams.SearchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageParams.PageNumber', page);
      params = params.append('PageParams.PageSize', itemPerPage);
    }

    return this.httpClient
      .get<any>(`${this.APIUrl}SubscriptionFees/GetFeesYearly`, {
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

  savedueSubPayment(obj: any) {
    return this.httpClient.post<any>(
      `${this.APIUrl}SubscriptionPayments/SaveDuePayment`,
      obj
    );
  }
  saveAdvancedSubPayment(obj: any[], memberId: number) {
    return this.httpClient.post<any>(
      `${this.APIUrl}/api/SubscriptionPayments/SaveAdvancedPayment?memberId=${memberId}`,
      obj
    );
  }

  getSubscriptionPaymentList(
    startDate: any,
    endDate: any,
    memberShipNo: any,
    pageNo: any,
    pageSize: any
  ) {
    return this.httpClient.get<any>(
      `${this.APIUrl}SubscriptionPayments/GetAllSubscriptionPayment?startDate=${startDate}&endDate=${endDate}&memberShipNo=${memberShipNo}&pageNo=${pageNo}&pageSize=${pageSize}`
    );
  }

  getSubscriptionPaymentNo(paymentNo) {
    return this.httpClient.get<any>(
      `${this.APIUrl}SubscriptionPayments/GetSubscriptionPayment?payemntNo=${paymentNo}`
    );
  }

  getSubscriptionPaymentReport(payemntNo): Observable<Blob> {
    return this.httpClient.get(
      `${this.APIUrl}SubscriptionPayments/GetSubscriptionPaymentReport?payemntNo=${payemntNo}`,
      {
        responseType: 'blob',
      }
    );
  }
  getMemberInfoByMemberShipNo(memberShipNo: string) {
    return this.httpClient
      .get<any>(
        `${this.APIUrl}RegisterMembers/GetByMemberShipNo?memberShipNo=${memberShipNo}`
      )
      .pipe(map((response: any) => response));
  }
  getSubscriptionPaymentPaidUpTo(id: any) {
    return this.httpClient.get<any>(
      `${this.APIUrl}SubscriptionPayments/PaidListByMemberId?id=${id}`
    );
  }
  getSubscriptionPaymentDueList(id: any) {
    return this.httpClient.get<any>(
      `${this.APIUrl}SubscriptionPayments/DueListByMemberId?id=${id}`
    );
  }
  getSubscriptionPaymentAdvancedList(id: any) {
    return this.httpClient.get<any>(
      `${this.APIUrl}SubscriptionPayments/AdvancedListByMemberId?id=${id}`
    );
  }
}



