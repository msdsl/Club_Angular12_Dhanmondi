import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Response } from '../../../shared/models/Response';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(private http: HttpClient) {}
  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

getCategoryPatterns() {
  return this.http.get<Response>(`${this.APIUrl}CategoryPatterns/GetCategoryPatterns`);
}


}
