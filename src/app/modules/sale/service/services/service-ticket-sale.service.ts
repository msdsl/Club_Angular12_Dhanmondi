import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServiceTicketSaleService {
  onVenueBookingCreated: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;

  getMemservice(pageNo: number, pageSize: number) {
    return this.httpClient.get<any>(
      `${this.APIUrl}MemServices/GetAll?pageNo=${pageNo}&pageSize=${pageSize}`
    );
  }
  GetAllServiceOnly(pageNo: number, pageSize: number) {
    return this.httpClient.get<any>(
      `${this.APIUrl}MemServices/GetAllServiceOnly?pageNo=${pageNo}&pageSize=${pageSize}`
    );
  }
  GetAllTicketByServiceIdQuery(serviceId: any) {
    return this.httpClient.get<any>(
      `${this.APIUrl}ServiceTickets/GetAllTicketByServiceIdQuery?serviceId=${serviceId}`
    );
  }

  createServiceSell(serviceSaleObj: any) {
    return this.httpClient.post<any>(
      `${this.APIUrl}Sales/ServiceSaleSave`,
      serviceSaleObj
    );
  }

  getAllServiceTicket(page, itemPerPage, searchKey, filters) {
    let params = new HttpParams();

    if (filters) {
      if (filters.StartDate) {
        params = params.append('StartDate', filters.StartDate);
      }
      if (filters.EndDate) {
        params = params.append('EndDate', filters.EndDate);
      }
      if (filters.TicketCriteriaId) {
        params = params.append('TicketCriteriaId', filters.TicketCriteriaId);
      }
      if (filters.BookingStatus) {
        params = params.append('BookingStatus', filters.BookingStatus);
      }
    }

    if (searchKey != null) {
      params = params.append('PageParams.SearchKey', searchKey);
    }

    if (page != null && itemPerPage != null) {
      params = params.append('PageParams.PageNumber', page);
      params = params.append('PageParams.PageSize', itemPerPage);
    }

    return this.httpClient.get<any>(
      `${this.APIUrl}Sales/ServiceSaleGet`,
      {
        params,
      }
    );
  }
  getAvailableServiceSlot(date?, serviceTicketId?) {
    let params = new HttpParams();

    if (date) {
      params = params.set('date', date); // Assuming your API accepts ISO strings for dates
    }
    if (serviceTicketId) {
      params = params.set('serviceTicketId', serviceTicketId.toString());
    }

    return this.httpClient.get<any>(
      `${this.APIUrl}Sales/AvailableServiceSlot`,
      { params }
    );
  }

  removeServiceTicket(Id: number) {
    return this.httpClient.delete<any>(
      `${this.APIUrl}Sales/RemoveServiceSale?id=${Id}`
    );
  }

  getServiceSaleTicket(id: number) {
    return this.httpClient.get<any>(
      `${this.APIUrl}Sales/GetServiceSaleTicketListById?serviceSaleId${id}`
    );
  }

  getAllTicketByServiceIdQuery(serviceId: any) {
    return this.httpClient.get<any>(
      `${this.APIUrl}Sales/GetServiceSaleTicketListById?serviceSaleId=${serviceId}`
    );
  }

  getServiceInvoiceReport(id: any): Observable<Blob> {
    return this.httpClient.get(
      `${this.APIUrl}Sales/PrintServiceSaleReport?saleId=` + id,
      {
        responseType: 'blob',
      }
    );
  }
  sendEventInvoiceEmail(saleServiceId: number, memEmail: string) {
    return this.httpClient.get<any>(
      `${this.APIUrl}Sales/SendServiceInvoiceEmail?saleServiceId=${saleServiceId}&memEmail=${memEmail}`
    );
  }
  cancelServiceSale(cancelServiceSaleInfo) {
    return this.httpClient.post<any>(
      `${this.APIUrl}Sales/CancelServiceSale`,
      cancelServiceSaleInfo
    );
  }
}
