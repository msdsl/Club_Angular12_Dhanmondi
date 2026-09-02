import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserModel } from '../../models/user.model';
import { environment } from '../../../../../environments/environment';
import { AuthModel } from '../../models/auth.model';



@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  // public methods
  login(email: string, password: string): Observable<any> {
    var loginInfo = {
      AppId:"WEBAPP",
      DeviceToken: "null",
      Email:email,
      Password:password
    }
    return this.http.post<AuthModel>(`${this.APIUrl}Login/Authenticate`, loginInfo);
    // return this.http.post<AuthModel>(`${this.APIUrl}/login`, {
    //   email,
    //   password,
    // });
  }

  // CREATE =>  POST: add a new user to the server
  createUser(user: UserModel): Observable<UserModel> {
    return this.http.post<UserModel>(this.APIUrl, user);
  }

  // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.APIUrl}/forgot-password`, {
      email,
    });
  }

  getUserByToken(token: string): Observable<UserModel> {
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<UserModel>(`${this.APIUrl}/me`, {
      headers: httpHeaders,
    });
  }
}
