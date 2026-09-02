import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  onAvailabilityCreated: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  createAvailability(data): Observable<any> {
    return this.httpClient
      .post<any>(this.APIUrl + 'Availabilities/Save', data)
      .pipe(catchError(this.handleError));
  }

  updateAvailability(data): Observable<any> {
    return this.httpClient
      .put<any>(this.APIUrl + 'Availabilitys/' + data.id, data)
      .pipe(catchError(this.handleError));
  }

  getById(id): Observable<any> {
    return this.httpClient
      .get<any>(this.APIUrl + 'Availabilities/GetAlleById?id=' + id)
      .pipe(catchError(this.handleError));
  }
  deleteAvailability(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(this.APIUrl + 'Availabilities/Remove?id=' + id)
      .pipe(catchError(this.handleError));
  }

  getDetailById(id: any) {
    return this.httpClient.get<any>(`${this.APIUrl}Availabilities/GetAlleById?id=${id}`);
  }

  getAvailabilityPagination(page?, itemPerPage?, searchKey?) {
    let params = new HttpParams();

    if (searchKey != null) {
      params = params.append('SearchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageNumber', page);
      params = params.append('PageSize', itemPerPage);
    }

    return this.httpClient
      .get<any>(`${this.APIUrl}Availabilities/GetAll`, {
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
