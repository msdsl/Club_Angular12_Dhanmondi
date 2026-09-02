import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  onManageChargeCreated: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

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
      .get<any>(`${this.APIUrl}RegisterMembers/GetByMemberShipNo?memberShipNo=${memberShipNo}`)
      .pipe(map((response: any) => response));
  }
  getSubscriptionPaymentPaidUpTo(id: any) {
    return this.httpClient.get<any>(`${this.APIUrl}SubscriptionPayments/PaidListByMemberId?id=${id}`);
  }
  getSubscriptionPaymentDueList(id: any) {
    return this.httpClient.get<any>(`${this.APIUrl}SubscriptionPayments/DueListByMemberId?id=${id}`);
  }
  getSubscriptionPaymentAdvancedList(id: any) {
    return this.httpClient.get<any>(`${this.APIUrl}SubscriptionPayments/AdvancedListByMemberId?id=${id}`);
  }
}
