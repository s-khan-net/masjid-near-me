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

  public deleteUserAccount(userEmail: string, reason: string) {
    const url = `${MnmConstants.baseUrl}users`;
    //make user object with email and reason
    const user = {
      user: {
        userEmail: userEmail,
        reason: reason,
      },
    };
    return this._dataService.deleteService(url, user);
  }

  public sendFeedback(userEmail: string, feedback: string) {
    const url = `${MnmConstants.baseUrl}feedback`;
    //make user object with email and reason
    const user = {
      user: {
        userEmail: userEmail,
        feedbackType: 'app',
        feedbackContent: feedback,
      },
    };
    return this._dataService.postService(url, user);
  }

  public sendPermissionReq(userEmail: string) {
    const url = `${MnmConstants.baseUrl}feedback`;
    //make user object with email and reason
    const user = {
      user: {
        userEmail: userEmail,
        feedbackType: 'permission',
        feedbackContent: 'Permission Request',
      },
    };
    return this._dataService.postService(url, user);
  }

  public  checkFeedbackPermission(email: string) {
    const url = `${MnmConstants.baseUrl}feedback/${email}`;
    return this._dataService.getDataWithTextHeader(url);
  }
}
