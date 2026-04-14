import { Injectable } from '@angular/core';
import { DataService } from '../core/services/dataservice.service';
import { MnmConstants } from '../core/mnm-constants';
import { of } from 'rxjs';
import { StorageService } from '../core/services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private _dataService: DataService, private _storage: StorageService) {}

  public async getUserByToken() {
    let url = `${MnmConstants.baseUrl}auth/verify`;
    const token = await this._storage.get('token');
    if (token) {
      return this._dataService.postService(url, { token });
    } else {
      return of(null);
    }
  }

  public async updateMyMasjidsForUser(myMasjids: any) {
    let res: boolean = false;
    return new Promise(async (resolve, reject) => {
      (await this.getUserByToken()).subscribe(async (data) => {
        if (data && data.body.user) {
          let userObj = {
            user: data.body.user,
          };
          userObj.user.myMasjids = myMasjids;
          res = await this._updateUser(userObj);
          if (res) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          console.log('No user found');
          resolve(false);
        }
      });
    });
  }
  private _updateUser(userObj: { user: any; }): Promise<boolean> {
    const url = `${MnmConstants.baseUrl}${MnmConstants.usersMidPath}`;
    return new Promise((resolve, reject) => {
      this._dataService.putService(url, userObj).subscribe((data) => {
        if (JSON.stringify(data)) {
          if (JSON.parse(JSON.stringify(data)).body.updated) {
            console.log('Masjid list updated successfully');
            resolve(true);
          }
        } else {
          console.log('Masjid list update failed');
          reject(false);
        }
      });
    });
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
