import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  sendCustomEmailByExcel(obj) {
    return this.httpClient.post<any>(
      `${this.APIUrl}Commons/ExcelFileProcess`,
      obj
    );
  }
  sendBulkEmail(EmailObj: any) {
    return this.httpClient.post<any>(
      `${this.APIUrl}Commons/SendBulkEmail`,
      EmailObj
    );
  }
}
