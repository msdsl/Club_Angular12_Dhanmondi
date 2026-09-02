import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppDownloadService {
  constructor(private http: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  getAppDownloadReport(IsActive): Observable<Blob> {
    return this.http.get(
      `${this.APIUrl}AppDownload/GetAppDownloadReport?IsActive=${IsActive}`,
      {
        responseType: 'blob',
      }
    );
  }
}
