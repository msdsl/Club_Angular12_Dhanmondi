import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  constructor(private http: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  changePassword(obj: any) {
    return this.http.post<any>(`${this.APIUrl}Users/ChangedPassword`, obj);
  }
}
