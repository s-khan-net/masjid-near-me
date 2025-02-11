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
}
