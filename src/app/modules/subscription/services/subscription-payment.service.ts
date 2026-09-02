import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPaymentService {

  onManageChargeCreated: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) { }

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;
  savedueSubPayment(obj: any) {
    return this.httpClient.post<any>(
      `${this.APIUrl}SubscriptionPayments/SaveDuePayment`,
      obj
    );
  }


  SaveAdvancedPayment(model: any) {
    return this.httpClient.post<any>(
      `${this.APIUrl}SubscriptionPayments/SaveAdvancedPayment`,
      model
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
}
