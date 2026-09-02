import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AreaLayoutService {
  constructor(private http: HttpClient) {}
  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  getPagination(page?, itemPerPage?, searchKey?) {
    let params = new HttpParams();

    if (searchKey != null) {
      params = params.append('PageParams.SearchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageParams.PageNumber', page);
      params = params.append('PageParams.PageSize', itemPerPage);
    }

    return this.http
      .get<any>(`${this.APIUrl}AreaLayouts/GetAll`, {
        params,
      })
      .pipe(map((response: any) => response));
  }

  getAreaLayoutDetailsList() {
    return this.http.get<any>(
      `${this.APIUrl}AreaLayouts/GetAllWithDetails`
    );
  }

  getAreaLayoutDetailsById(id: number) {
    return this.http.get<any>(
      `${this.APIUrl}/api/AreaLayouts/GetAlleById?id=` + id
    );
  }

  create(area: any) {
    return this.http.post<any>(
      `${this.APIUrl}AreaLayouts/Save`,
      area
    );
  }
  delete(Id: number) {
    return this.http.delete<Response>(
      `${this.APIUrl}AreaLayouts/Remove?id=${Id}`
    );
  }

  getAreaLayoutMatrixById(id: number) {
    return this.http.get<Response>(
      `${this.APIUrl}/api/AreaLayouts/GetAreaTableById?id=` + id
    );
  }
}
