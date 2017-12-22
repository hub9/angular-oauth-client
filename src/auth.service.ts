import * as Rx from 'rxjs/Rx';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';


export class AuthServiceConfig {
  apiId: string;
  apiSecret: string;
  apiUrl: string;
  apiOauthUrl: string;
  unauthorizedRoute: string;
}

@Injectable()
export class AuthService {
  isAuthenticated = false;
  token: string = null;
  me: any = {};
  private authData: any = {};
  authenticatedChanged: Rx.Subject<any> = new Rx.Subject();

  constructor(private config: AuthServiceConfig, private http: HttpClient,
              @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const t = window.localStorage.getItem('auth_data');

    if (t != null) {
      this.authData = JSON.parse(t);
      this.token = this.authData.access_token;
      this.isAuthenticated = true;
      this.authenticatedChanged.next(true);
      if (this.authData.expiration <= new Date().getTime() + 100000) {
        this.refresh_token().subscribe();
      }
    }
  }

  login(username: string, password: string): Rx.Observable<any> {
    const data = 'username=' + username + '&password=' + password + '&grant_type=password&client_id=' +
      this.config.apiId + '&client_secret=' + this.config.apiSecret;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    let r = this.http.post(this.config.apiOauthUrl + 'token/', data, {headers: headers});
    return r.map(res => {
      this.authData = res;
      this.token = this.authData.access_token;
      this.isAuthenticated = true;
      this.authenticatedChanged.next(true);
      this.authData.expiration = new Date().getTime() + (this.authData.expires_in * 1000);
      window.localStorage.setItem('auth_data', JSON.stringify(this.authData));
      return this.authData;
    });
  }

  logout(): void {
    this.token = null;
    this.isAuthenticated = false;
    this.authenticatedChanged.next(false);
    this.authData = {};
    if (!isPlatformServer(this.platformId)) {
      window.localStorage.removeItem('auth_data');
    }
  }

  refresh_token(): Rx.Observable<any> {
    const data = 'grant_type=refresh_token&client_id=' + this.config.apiId + '&client_secret=' +
      this.config.apiSecret + '&refresh_token=' + this.authData.refresh_token;
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
    headers = headers.set('Authorization', 'Bearer ' + this.authData.refresh_token);
    return this.http.post(this.config.apiOauthUrl + 'token/', data, {headers: headers})
      .do(d => {
      }, e => {
        if (e.status === 401) {
          this.logout();
        }
      })
      .map(res => {
        this.authData = res;
        this.token = this.authData.access_token;
        this.isAuthenticated = true;
        this.authenticatedChanged.next(true);
        this.authData.expiration = new Date().getTime() + (this.authData.expires_in * 1000);
        window.localStorage.setItem('auth_data', JSON.stringify(this.authData));
        return this.authData;
      });
  }

  getToken(): Rx.Observable<any> {
    return Rx.Observable.create((observer: any) => {
      if (this.token != null) {
        if (!this.authData.expiration || this.authData.expiration <= new Date().getTime() + 100000) {
          this.refresh_token().subscribe(d => {
            observer.next(this.token);
            observer.complete();
          });
        } else {
          observer.next(this.token);
          observer.complete();
        }
      } else {
        observer.next(null);
        observer.complete();
      }
    });
  }

  request(method: string, url: string, data: any = {}, headers: any = new HttpHeaders()): Rx.Observable<any> {
    let hasFile = false;
    if (!isPlatformServer(this.platformId)) {
      let formData: FormData = new FormData();
      hasFile = assignFormdata(formData, data);
      if (!hasFile) {
        data = JSON.stringify(data);
      } else {
        data = formData;
      }
    } else {
      data = JSON.stringify(data);
    }

    return Rx.Observable.create((obs: any) => {
      this.getToken().subscribe(d1 => {
        headers = headers.set('Authorization', 'Bearer ' + this.token);
        if (!hasFile) {
          headers = headers.set('Content-Type', 'application/json');
        }
        let options = {headers: headers, body: data};
        let req =  new HttpRequest(method, this.config.apiUrl + url, options);

        this.http.request(req).subscribe(
          (d2: any) => {
            if (d2 instanceof HttpResponse) {
              if (d2.status === 204) {
                obs.next(null);
              } else {
                obs.next(d2.body);
              }
            }
          },
          e => {
            if (e.status === 401) {
              this.logout();
            }
            obs.error(e);
          },
          () => obs.complete()
        );
      });
    });
  }

  get(url: string): Rx.Observable<any> {
    return this.request('GET', url);
  }

  post(url: string, data: any): Rx.Observable<any> {
    return this.request('POST', url, data);
  }

  patch(url: string, data: any): Rx.Observable<any> {
    return this.request('PATCH', url, data);
  }

  delete(url: string): Rx.Observable<any> {
    return this.request('DELETE', url);
  }
}


function assignFormdata(formdata: FormData, data: any) {
  let hasFile = false;
  for (let i in data) {
    if (data[i] instanceof File) {
      formdata.append(i, data[i]);
      hasFile = true;
    } else if (data[i] instanceof Object) {
      formdata.append(i, JSON.stringify(data[i]));
    } else {
      formdata.append(i, data[i]);
    }
  }
  return hasFile;
}
