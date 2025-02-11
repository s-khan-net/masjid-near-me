import { Injectable } from '@angular/core';
import { IUser } from 'src/app/models/user.model';
import { DataService } from './dataservice.service';
import { MnmConstants } from '../mnm-constants';
import { LoaderService } from './loader.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private _dataService: DataService) {}

  public signIn(user: any): Observable<any> {
    let url = `${MnmConstants.baseUrl}auth`;
    return this._dataService.postService(url, user).pipe(
      map((data) => {
        console.log(data, ' token: ', data.headers.get('x-auth-token'));
        sessionStorage.setItem('token', data.headers.get('x-auth-token'));
        sessionStorage.setItem('userEmail', data.body.user.userEmail);
        sessionStorage.setItem(
          'userSettings',
          btoa(JSON.stringify(data.body.user.settings))
        );
        sessionStorage.setItem(
          'userRole',
          btoa(JSON.stringify(data.body.user.role))
        );
        let profile = data.body.user.userprofile;
        profile['phone'] = data.body.user.userPhone;
        sessionStorage.setItem('userProfile', btoa(JSON.stringify(profile)));
        return data;
      })
    );
  }

  public signUp(user: any): Observable<any> {
    let url = `${MnmConstants.baseUrl}users`;
    return this._dataService.postService(url, user);
  }
}
