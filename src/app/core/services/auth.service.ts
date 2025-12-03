import { Injectable } from '@angular/core';
import { IUser } from 'src/app/models/user.model';
import { DataService } from './dataservice.service';
import { MnmConstants } from '../mnm-constants';
import { LoaderService } from './loader.service';
import { map, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private _dataService: DataService,
    private _storage: StorageService
  ) {}

  public signIn(user: any): Observable<any> {
    let url = `${MnmConstants.baseUrl}auth`;
    return this._dataService.postService(url, user).pipe(
      map((data) => {
        if (data.body && data.body.status.toLowerCase() == 'error') {
          return data;
        }

        /**using sessionstorage to store the token as the interceptor does not work as an async method
         * if StorageService is used in the interceptor, then storge.get has to be an async method
         */
        sessionStorage.setItem('token', data.headers.get('x-auth-token'));
        this._storage.set('token', data.headers.get('x-auth-token'));
        this._storage.set('userEmail', data.body.user.userEmail);
        // this._storage.set(
        //   'userSettings',
        //   btoa(JSON.stringify(data.body.user.settings))
        // );
        this._storage.set(
          'userRole',
          btoa(JSON.stringify(data.body.user.role))
        );
        let profile = data.body.user.userprofile;
        profile['phone'] = data.body.user.userPhone;
        this._storage.set('userProfile', btoa(JSON.stringify(profile)));
        return data;
      })
    );
  }

  public signUp(user: any): Observable<any> {
    let url = `${MnmConstants.baseUrl}users`;
    return this._dataService.postService(url, user);
  }

  public verfiyUser(code: any): Observable<any> {
    let url = `${MnmConstants.baseUrl}users/verify`;
    return this._dataService.postService(url, code);
  }
}
