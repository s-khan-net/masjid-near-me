import { Injectable } from '@angular/core';
import { DataService } from '../core/services/dataservice.service';
import { MnmConstants } from '../core/mnm-constants';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(
    private _dataService: DataService,
    private _userService: UsersService
  ) {}

  getSettings() {}

  updateSettings(userSettings: any, type: SettingType): Promise<boolean> {
    let res: boolean = false;
    return new Promise(async (resolve, reject) => {
      (await this._userService.getUserByToken()).subscribe(async (data) => {
        if (data && data.body.user) {
          let userObj = {
            user: data.body.user,
          };
          userObj.user.settings = userSettings;
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

  private _updateUser(userObj: { user: any }): Promise<boolean> {
    const url = `${MnmConstants.baseUrl}${MnmConstants.usersMidPath}`;
    return new Promise((resolve, reject) => {
      this._dataService.putService(url, userObj).subscribe((data) => {
        if (JSON.stringify(data)) {
          if (JSON.parse(JSON.stringify(data)).body.updated) {
            console.log('Settings updated successfully');
            resolve(true);
          }
        } else {
          console.log('Settings update failed');
          reject(false);
        }
      });
    });
  }
}

export enum SettingType {
  PROFILE = 'profile',
  SETTINGS = 'settings',
}
