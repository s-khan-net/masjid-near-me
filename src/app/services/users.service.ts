import { Injectable } from '@angular/core';
import { DataService } from '../core/services/dataservice.service';
import { MnmConstants } from '../core/mnm-constants';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private _dataService: DataService) {}

  public getUserByToken() {
    let url = `${MnmConstants.baseUrl}auth/verify`;
    const token = sessionStorage.getItem('token');
    if (token) {
      return this._dataService.postService(url, { token });
    } else {
      return of(null);
    }
  }
}
