import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import {
  catchError,
  filter,
  finalize,
  mergeMap,
  switchMap,
  take,
} from "rxjs/operators";
import { AuthService } from "..";
import { environment } from "src/environments/environment";
import { SpinnerService } from "src/app/shared/services/spinner.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(
    private _authenticationService: AuthService,
    private spinnerService: SpinnerService

  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    
    // const currentUser = this._authenticationService.currentUser$;
    const currentUser = JSON.parse(localStorage.getItem("currentBgclUser"));
    const isLoggedIn = currentUser && currentUser.JWToken;
    const isApiUrl = request.url.startsWith(this.APIUrl);
    if (isLoggedIn && isApiUrl) {
      
      this.spinnerService.show()
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.JWToken}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: any) => {
        if (
          error instanceof HttpErrorResponse &&
          (error.status === 401 || error.status === 403)
        ) {
          return this.handle401Error(request, next);
        } else {
          return throwError(error);
        }
      }),
      finalize(() => {
        
        this.spinnerService.hide();
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      return this._authenticationService.refreshToken().pipe(
        switchMap((newToken: any) => {
          
          if (newToken) {
            localStorage.setItem("currentUser", JSON.stringify(newToken));
            localStorage.setItem("JWToken", newToken.JWToken);
            localStorage.setItem("RefreshToken", newToken.RefreshToken);
            this.refreshTokenSubject.next(newToken);
            return next.handle(this.addToken(request, newToken.JWToken));
          }
          // this._authenticationService.logout();
          return throwError("Refresh token failed");
        }),
        catchError((error) => {
          // this._authenticationService.logout();
          return throwError(error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}
