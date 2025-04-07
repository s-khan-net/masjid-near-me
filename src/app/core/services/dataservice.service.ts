import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  baseUrl: any;
  masjidApiPostfix: any;

  constructor(private _http: HttpClient) {}

  public getData(url: string): Observable<any> {
    return this._http.get(url);
  }
  public getDataWithTextHeader(url: string): Observable<any> {
    let header: HttpHeaders = new HttpHeaders('Content-Type:text/plain');
    return this._http
      .get(url, { responseType: 'text' })
      .pipe(
        map((data: any) => data),
        catchError((error) => throwError(error))
      );
  }
  public getDataWithHeaderAndParams(url: string, params: any): Observable<any> {  
    let header: HttpHeaders = new HttpHeaders('Content-Type:application/json');
    return this._http
      .get(url, { params: params })
      .pipe(
        map((data: any) => data),
        catchError((error) => throwError(error))
      );
  }
  public postService(url: string, body: any): Observable<any> {
    let header: HttpHeaders = new HttpHeaders('Content-Type:application/json');
    return this._http
      .post(url, body, { headers: header, observe: 'response' })
      .pipe(
        map((data: any) => data),
        catchError((error) => throwError(error))
      );
  }

  public putService(url: string, body: any): Observable<any> {
    let header: HttpHeaders = new HttpHeaders('Content-Type:application/json');
    return this._http
      .put(url, body, { headers: header, observe: 'response' })
      .pipe(
        map((data: any) => data),
        catchError((error) => throwError(error))
      );
  }

  public deleteService(url: string, user: any) {
    let header: HttpHeaders = new HttpHeaders('Content-Type:application/json');
    return this._http
      .delete(url, { headers: header, observe: 'response', body: user })
      .pipe(
        map((data: any) => data),
        catchError((error) => throwError(error))
      );
  }
}
