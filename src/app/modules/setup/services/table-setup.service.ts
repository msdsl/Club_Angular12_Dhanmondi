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
export class TableSetupService {
  onCollegeCreated: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  create(data): Observable<any> {
    return this.httpClient
      .post<any>(this.APIUrl + 'TableSetups/Save', data)
      .pipe(catchError(this.handleError));
  }

  update(data): Observable<any> {
    return this.httpClient
      .put<any>(this.APIUrl + 'TableSetups/' + data.id, data)
      .pipe(catchError(this.handleError));
  }

  getById(id): Observable<any> {
    return this.httpClient
      .get<any>(this.APIUrl + 'TableSetups/' + id)
      .pipe(catchError(this.handleError));
  }
  delete(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(this.APIUrl + 'TableSetups/Remove?id=' + id)
      .pipe(catchError(this.handleError));
  }

  getPagination(page?, itemPerPage?, searchKey?) {
    let params = new HttpParams();

    if (searchKey != null && searchKey !== '') {
      params = params.append('PageParams.SearchKey', searchKey);
      params = params.append('SearchKey', searchKey);
      params = params.append('searchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageParams.PageNumber', page.toString());
      params = params.append('PageParams.PageSize', itemPerPage.toString());
      params = params.append('PageNo', page.toString());
      params = params.append('PageSize', itemPerPage.toString());
      params = params.append('PageNumber', page.toString());
    }

    return this.httpClient
      .get<any>(`${this.APIUrl}TableSetups/GetAll`, {
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
