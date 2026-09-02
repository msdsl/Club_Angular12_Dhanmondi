import {
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/models/pagination.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MemberStatusService {

  onMemberStatusCreated: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  createMemberStatus(data): Observable<any> {
    return this.httpClient
      .post<any>(this.APIUrl + 'MemberStatuss/Save', data)
      .pipe(catchError(this.handleError));
  }

  deleteMemberStatus(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(this.APIUrl + 'MemberStatuss/Remove?id=' + id)
      .pipe(catchError(this.handleError));
  }

  getMemberStatusPagination(page?, itemPerPage?, searchKey?) {
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

    return this.httpClient.get<any>(`${this.APIUrl}MemberStatuss/GetAll`,{
          params,
        }).pipe(map((response: any) => response));
      
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
