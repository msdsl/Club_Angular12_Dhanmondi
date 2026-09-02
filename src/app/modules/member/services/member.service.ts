import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  onMemberCreated: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;
  

  createMember(data): Observable<any> {
    return this.httpClient
      .post<any>(this.APIUrl + 'RegisterMembers/Save', data)
      .pipe(catchError(this.handleError));
  }
  saveMemberFamilyInfo(data): Observable<any> {
    return this.httpClient
      .post<any>(this.APIUrl + 'RegisterMembers/FamilySave', data)
      .pipe(catchError(this.handleError));
  }
  getMemberFeesList(memberTypeId: number) {
    return this.httpClient.get<any>(`${this.APIUrl}MemberShipFees/GetAll?memberTypeId=${memberTypeId}`);
  }
  saveMemberFeeInfo(feeRes: any) {
    return this.httpClient.post<any>(`${this.APIUrl}RegisterMembers/MemberRegistrationFeeSave`, feeRes);
  }
  getMemberInformations(memberShipNo: string) {
    return this.httpClient
      .get<any>(`${this.APIUrl}RegisterMembers/GetByMemberShipNo?memberShipNo=${memberShipNo}`)
      .pipe(map((response: any) => response.Data));
  }
  getMemberInfoById(Id: number) {
    return this.httpClient
      .get<Response>(`${this.APIUrl}RegisterMembers/GetById?id=${Id}`)
      .pipe(map((response: any) => response.Data));
  }
  getMemberLedgerList(id: string, pageNo: number, pageSize: number) {
    return this.httpClient.get<any>(
      `${this.APIUrl}TopUps/GetMemberLedger?id=${id}&pageNo=${pageNo}&pageSize=${pageSize}`
    );
  }

  saveAdvancedSubPayment(obj: any[], memberId: number) {
    return this.httpClient.post<any>(
      `${this.APIUrl}/api/SubscriptionPayments/SaveAdvancedPayment?memberId=${memberId}`,
      obj
    );
  }

  getMemberPagination(page?, itemPerPage?, searchKey?, filters?) {
    let params = new HttpParams();

    if (filters) {
      if (filters.MemberShipNo) {
        params = params.append('MemberShipNo', filters.MemberShipNo);
      }
      if (filters.FullName) {
        params = params.append('FullName', filters.FullName);
      }
      if (filters.CadetName) {
        params = params.append('CadetName', filters.CadetName);
      }
      if (filters.MemberTypeId) {
        params = params.append('MemberTypeId', filters.MemberTypeId);
      }
      if (filters.MemberActiveStatusId) {
        params = params.append(
          'MemberActiveStatusId',
          filters.MemberActiveStatusId
        );
      }
      if (filters.Phone) {
        params = params.append('Phone', filters.Phone);
      }
      if (filters.Email) {
        params = params.append('Email', filters.Email);
      }
      if (filters.CollegeId) {
        params = params.append('CollegeId', filters.CollegeId);
      }
      if (filters.BatchNo) {
        params = params.append('BatchNo', filters.BatchNo);
      }
      if (filters.BloodGroupId) {
        params = params.append('BloodGroupId', filters.BloodGroupId);
      }
      if (filters.MemberProfessionId) {
        params = params.append(
          'MemberProfessionId',
          filters.MemberProfessionId
        );
      }
      if (filters.Organaization) {
        params = params.append('Organaization', filters.Organaization);
      }
      if (filters.Designation) {
        params = params.append('Designation', filters.Designation);
      }
      if (filters.Specialization) {
        params = params.append('Specialization', filters.Specialization);
      }
      if (filters.HscYear) {
        params = params.append('HscYear', filters.HscYear);
      }
      if (filters.CadetNo) {
        params = params.append('CadetNo', filters.CadetNo);
      }
    }

    if (searchKey != null) {
      params = params.append('PageParams.SearchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageParams.PageNumber', page);
      params = params.append('PageParams.PageSize', itemPerPage);
    }

    return this.httpClient
      .get<any>(`${this.APIUrl}RegisterMembers/GetMemberData`, {
        params,
      })
      .pipe(map((response: any) => response));
  }
  getAllBloodGroupData() {
    return this.httpClient.get<any>(
      `${this.APIUrl}Commons/GetAllBloodGroup`
    );
  }
  deleteMember(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(this.APIUrl + 'MemberCategories/Remove?id=' + id)
      .pipe(catchError(this.handleError));
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
