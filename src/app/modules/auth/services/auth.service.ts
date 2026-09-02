import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AuthHTTPService } from './auth-http/auth-http.service';
import { LayoutService } from 'src/app/_metronic/layout';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';


export type UserType = UserModel | undefined;


@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {

  windowObj: any = window;
  private readonly APIUrl = this.windowObj.__env.apiUrl;
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `currentBgclUser`;
  jwtHelper = new JwtHelperService();
  // public fields
  currentUser$: Observable<any>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<any>;
  isLoadingSubject: BehaviorSubject<boolean>;
  private jWToken = "JWToken";
  private refToken = "RefreshToken";
  

  get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: any) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router,
    private layoutService:LayoutService,
    private http: HttpClient,
    private _toastrService: ToastrService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<any>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  // login(email: string, password: string) {
  //   var loginInfo = {
  //     AppId:"WEBAPP",
  //     DeviceToken: "null",
  //     Email:email,
  //     Password:password
  //   }
  //   return this.http.post<AuthModel>(`${API_USERS_URL}Login/Authenticate`, loginInfo);
  // }
  login(email: string, password: string): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.login(email, password).pipe(
      
      map((auth: any) => {
        
        this.currentUserSubject.next(auth);
        const result = this.setAuthFromLocalStorage(auth);
        return auth;
      }),
      
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  loggedIn() {
    
    const user = localStorage.getItem(this.authLocalStorageToken);
    return !this.jwtHelper.isTokenExpired(JSON.parse(user)?.JWToken);
  }

  public getSession(): boolean {
    return this.loggedIn();
  }


  getUser():Observable<any>{
    
    return this.currentUserSubject.pipe(
      map((user: any) => {
        
        if (user) {
          // this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
        console.log(user);
        
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
    
  }

  getMenuByUser(userId:any):Observable<any>{
  

    return this.layoutService.getMenuByUser(userId).pipe(
      map((menu: any) => {
        
        if (menu) {
          // this.currentUserSubject.next(menu);
        } else {
          this.logout();
        }
        console.log(menu);
        
        return menu;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // public methods
  // login(email: string, password: string): Observable<UserType> {
  //   this.isLoadingSubject.next(true);
  //   return this.authHttpService.login(email, password).pipe(
  //     map((auth: AuthModel) => {
  //       const result = this.setAuthFromLocalStorage(auth);
  //       return result;
  //     }),
  //     switchMap(() => this.getUserByToken()),
  //     catchError((err) => {
  //       console.error('err', err);
  //       return of(undefined);
  //     }),
  //     finalize(() => this.isLoadingSubject.next(false))
  //   );
  // }



  getUserByToken(): Observable<UserType> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return this.authHttpService.getUserByToken(auth.authToken).pipe(
      map((user: UserType) => {
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // need create new user then login
  registration(user: UserModel): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.createUser(user).pipe(
      map(() => {
        this.isLoadingSubject.next(false);
      }),
      switchMap(() => this.login(user.email, user.password)),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  forgotPassword(email: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .forgotPassword(email)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  // private methods
  private setAuthFromLocalStorage(auth: AuthModel): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.authToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }




  refreshToken(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
    };
    // ;
    var users = {
      RefreshToken: localStorage.getItem(this.refToken),
      AccessToken: localStorage.getItem(this.jWToken),
    };
    return this.http.post<any>(
      this.APIUrl + "Login/RefreshToken",
      users,
      httpOptions
    );
  }
  private saveToken(token: string, refreshToken: string): void {
    localStorage.setItem(this.jWToken, token);
    localStorage.setItem(this.refToken, refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem(this.jWToken);
  }
  logout() {
    

    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
    localStorage.removeItem("currentBgclUser");

    // this.http.get<any>(API_USERS_URL + "Login/Revoke").subscribe((result) => {
    //   setTimeout(() => {
    //     this._toastrService.success("You have successfully Logout", "", {
    //       toastClass: "toast ngx-toastr",
    //       closeButton: true,
    //     });
    //   }, 1000);
    //   localStorage.removeItem("currentUser");
    //   localStorage.removeItem("JWToken");
    //   localStorage.removeItem("RefreshToken");

    //   this.currentUserSubject.next(null);
    // });
  }






  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
