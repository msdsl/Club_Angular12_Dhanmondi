import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CollegeService {
  onCollegeCreated: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  createCollege(data): Observable<any> {
    return this.httpClient
      .post<any>(this.APIUrl + 'Colleges/Save', data)
      .pipe(catchError(this.handleError));
  }

  updateCollege(data): Observable<any> {
    return this.httpClient
      .put<any>(this.APIUrl + 'Colleges/' + data.id, data)
      .pipe(catchError(this.handleError));
  }

  getById(id): Observable<any> {
    return this.httpClient
      .get<any>(this.APIUrl + 'Colleges/' + id)
      .pipe(catchError(this.handleError));
  }
  deleteCollege(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(this.APIUrl + 'Colleges/Remove?id=' + id)
      .pipe(catchError(this.handleError));
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

  private handleError(errorResponse: HttpErrorResponse) {
    if (errorResponse.error instanceof ErrorEvent) {
      console.error('Client Side Error: ', errorResponse.error);
    } else {
      console.error('Server Side error', errorResponse);
    }
    return throwError('There is a problem with the service');
  }
}
