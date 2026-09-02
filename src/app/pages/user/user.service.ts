import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, map, throwError } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/models/pagination.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  onManageChargeCreated: Subject<any> = new Subject<any>();
  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  constructor(private httpClient: HttpClient) {}

  createUser(user: any) {
    return this.httpClient.post<any>(`${this.APIUrl}Users/SaveUser`, user);
  }

  getUserById(id: number) {
    return this.httpClient.get(`${this.APIUrl}Users/GetUserById?id=${id}`);
  }
  getRoleByUserId(userId: number) {
    return this.httpClient.get<any>(`${this.APIUrl}Users/GetRoleByUserId?UserId=${userId}`);
  }
  saveUserRoleByUser(obj: any) {
    return this.httpClient.post<any>(`${this.APIUrl}Users/SaveRoleByUserId`, obj);
  }

  getUserLogsByUserId(pageNo: number, pageSize: number, userId: string) {
    return this.httpClient.get<any>(
      `${this.APIUrl}Users/GetUserLogsByUserId?pageNo=${pageNo}&pageSize=${pageSize}&UserId=${userId}`
    );
  }

  getUserMenusByUserId(userId: string) {
    return this.httpClient.get<any>(`${this.APIUrl}Users/GetUserWiseMenus?userId=${userId}`);
  }
  getUserMenusByUserIdForPermission(userId: string) {
    return this.httpClient.get<any>(`${this.APIUrl}Users/GetUserMenusForPermission?userId=${userId}`);
  }
  saveUserMenuByUser(obj: any[], userId: number) {
    return this.httpClient.post<any>(`${this.APIUrl}Users/SaveUserMenuMapById?userId=${userId}`, obj);
  }
  resetPassword(id: number) {
    return this.httpClient.get<any>(`${this.APIUrl}Users/ResetPassword?userId=${id}`);
  }




  getPagination(page?, itemPerPage?, searchKey?) {
    let params = new HttpParams();

    if (searchKey != null) {
      params = params.append('SearchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageNumber', page);
      params = params.append('PageSize', itemPerPage);
      params = params.append('AppId', 'WEBAPP');
    }
    return this.httpClient
      .get<any>(`${this.APIUrl}Users/GetAllUsers`, {
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
