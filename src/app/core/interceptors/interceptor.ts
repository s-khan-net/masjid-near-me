import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'

@Injectable()
export class Interceptor implements HttpInterceptor {
  constructor() {}

  // Intercepts all HTTP requests!
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if(request.url.includes('aladhan') || request.url.includes('auth')) {
        return next.handle(request);
    }
    let token = sessionStorage.getItem('token');
    if (token) {
      const modifiedRequest = this.addToken(request, token);
      return next.handle(modifiedRequest);
    } else {
      return next.handle(request);
    }
  }

  // Adds the token to your headers if it exists
  private addToken(request: HttpRequest<any>, token: any) {
    if (token) {
      let clone: HttpRequest<any>;
      clone = request.clone({
        setHeaders: {
          Accept: `application/json`,
          'Content-Type': `application/json`,
          "x-auth-token": `Bearer ${token}`,
        },
      });
      return clone;
    }

    return request;
  }
}
