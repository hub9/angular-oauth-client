import { isPlatformServer, Location } from '@angular/common'
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { Inject, Injectable, PLATFORM_ID } from '@angular/core'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/map'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { AuthServiceConfig } from './auth.service.config'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type RequestBody = { [key: string]: string | File | Blob | any[] | object }

export interface AuthDataResponse {
  access_token: string,
  refresh_token: string,
  expires_in: number, // Seconds from request time
}

export interface AuthData extends AuthDataResponse {
  expiration: number, // Timestamp in ms
}

@Injectable()
export class AuthService {
  static localStorageKey = 'auth_data'
  static refreshThreshold = 10 * 60 * 1000 // 10 minutes in ms
  static emptyAuthData: AuthData = {
    access_token: null,
    refresh_token: null,
    expires_in: 0,
    expiration: 0,
  }

  private authUrl = Location.joinWithSlash(this.config.apiOauthUrl, '/token/')
  public readonly authData$ = new BehaviorSubject<AuthData>(AuthService.emptyAuthData)

  constructor(
    private config: AuthServiceConfig,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: string,
  ) {
    if (isPlatformServer(this.platformId)) {
      return
    }

    // Bind authRequestDataMap to this class before to prevent context errors when using
    // it as RxJS operator handler
    this.authRequestDataMap = this.authRequestDataMap.bind(this)

    this.storageLoad()
    this.refreshCheck()
  }

  /** Retrieve credentials from localStorage */
  private storageLoad(): AuthData {
    let authData = AuthService.emptyAuthData
    try {
      const authDataStr = localStorage.getItem(AuthService.localStorageKey)
      if (authDataStr) {
        authData = JSON.parse(authDataStr)
      }
    } catch (ignored) {} // LocalStorage not available

    this.authData$.next(authData)

    return authData
  }

  /** Store credentials in localStorage */
  private storageSave() {
    if (isPlatformServer(this.platformId)) {
      return
    }

    const authData = this.authData$.getValue()

    try {
      localStorage.setItem(AuthService.localStorageKey, JSON.stringify(authData))
    } catch (ignored) {}
  }

  /** Clear stored credentials in localStorage */
  private storageClear() {
    if (isPlatformServer(this.platformId)) {
      return
    }

    try {
      localStorage.removeItem(AuthService.localStorageKey)
    } catch (ignored) {}
  }

  /**
   * Check if token is expired.
   * If expired and there's a valid refresh token, it automatically requests a new one.
   * If not expired it start a timer to automatically refresh when expiration time is close.
   *
   * @return {boolean} true if valid, false if expired
   */
  private refreshCheck(): boolean {
    const authData = this.authData$.getValue()

    if (!authData.expiration || !authData.refresh_token) {
      return false
    }

    const now = Date.now()

    if (authData.expiration <= now + AuthService.refreshThreshold) {
      this.refresh().subscribe()
      return false
    }

    const expiresIn = authData.expiration - now
    const refreshTimeout = expiresIn - AuthService.refreshThreshold

    this.authData$.delay(refreshTimeout)
      .do(() => this.refresh().subscribe())
      .subscribe()
    return true
  }

  public isAuthenticated() {
    const authData = this.authData$.getValue()
    return authData.access_token != null
  }

  /**
   * Map function used to receive auth data:
   * 1) Convert AuthDataResponse to AuthData
   * 2) Update current credentials
   * 3) Store in localStorage
   * 4) Start a timer to automatically request for a refresh
   */
  private authRequestDataMap(response: AuthDataResponse): AuthData {
    const authData: AuthData = {
      ...response,
      expiration: Date.now() + (response.expires_in * 1000),
    }

    this.authData$.next(authData)
    this.storageSave()
    this.refreshCheck()

    return authData
  }

  /** Create an observable that performs the login procedure */
  public login(username: string, password: string): Observable<AuthData> {
    const data = `grant_type=password&username=${username}&password=${password}&` +
      `client_id=${this.config.apiId}&client_secret=${this.config.apiSecret}`

    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')

    return this.http.post<AuthDataResponse>(this.authUrl, data, { headers })
      .map(this.authRequestDataMap)
  }

  /** Create an observable that performs the refresh token procedure */
  private refresh(): Observable<AuthData> {
    const authData = this.authData$.getValue()

    if (!authData.refresh_token) {
      return Observable.of(AuthService.emptyAuthData)
    }

    const data = `grant_type=refresh_token&refresh_token=${authData.refresh_token}&` +
      `client_id=${this.config.apiId}&client_secret=${this.config.apiSecret}`

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${authData.refresh_token}`)

    return this.http.post<AuthDataResponse>(this.authUrl, data, { headers })
      .map(this.authRequestDataMap)
      .catch((error: HttpErrorResponse): Observable<AuthData> => {
        if (error.status === 401) {
          this.logout()
        }
        throw error
      })
  }

  /** Purge all credentials in use and stored */
  public logout() {
    this.authData$.next(AuthService.emptyAuthData)
    this.storageClear()
  }

  /** Pack structured request data to be used as request body */
  private packRequestData(data: RequestBody, headers: HttpHeaders)
  : [RequestBody|FormData|string, HttpHeaders] {
    if (!data) {
      return [undefined, headers]
    }

    if (isPlatformServer(this.platformId)) {
      return [data, headers]
    }

    let hasFile = false
    const formData = new FormData()

    for (const key of Object.keys(data)) {
      const value = data[key]

      if (value instanceof File) {
        formData.append(key, value)
        hasFile = true
      } else if (value instanceof Object) {
        // Object or Array
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value)
      }
    }

    return hasFile ? [
      formData,
      headers.set('Content-Type', 'multipart/form-data'),
    ] : [
      JSON.stringify(data),
      headers.set('Content-Type', 'application/json'),
    ]
  }

  /** Create an observable that makes HTTP requests */
  public request<T>(
    method: RequestMethod,
    url: string,
    data: RequestBody = {},
    headers: HttpHeaders = new HttpHeaders(),
  ): Observable<T> {
    const authData = this.authData$.getValue()
    let reqHeaders = headers
    let reqBody

    if (authData.access_token) {
      reqHeaders = headers.set('Authorization', `Bearer ${authData.access_token}`)
    }

    [reqBody, reqHeaders] = this.packRequestData(data, reqHeaders)
    const requestUrl = Location.joinWithSlash(this.config.apiUrl, url)

    return this.http.request<T>(method, requestUrl, { headers: reqHeaders, body: reqBody })
      .catch((error: HttpErrorResponse): Observable<T> => {
        if (error.status === 401) {
          this.logout()
        }
        throw error
      })
  }

  /** Create an observable that makes HTTP GET requests */
  public get<T>(url: string): Observable<T> {
    return this.request<T>('GET', url)
  }

  /** Create an observable that makes HTTP POST requests */
  public post<T>(url: string, data: RequestBody): Observable<T> {
    return this.request<T>('POST', url, data)
  }

  /** Create an observable that makes HTTP PATCH requests */
  public patch<T>(url: string, data: RequestBody): Observable<T> {
    return this.request<T>('PATCH', url, data)
  }

  /** Create an observable that makes HTTP PATCH requests */
  public put<T>(url: string, data: RequestBody): Observable<T> {
    return this.request<T>('PUT', url, data)
  }

  /** Create an observable that makes HTTP DELETE requests */
  public delete<T>(url: string): Observable<T> {
    return this.request<T>('DELETE', url)
  }
}
