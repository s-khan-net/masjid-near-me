import { Injectable } from '@angular/core';
import { DataService } from '../core/services/dataservice.service';
import { MnmConstants } from '../core/mnm-constants';
import { UsersService } from './users.service';
import { Device } from '@capacitor/device';
import { StorageService } from '../core/services/storage.service';


@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(
    private _dataService: DataService,
    private _userService: UsersService,
    private _storageService: StorageService
  ) {
    this.getOsVersion();
  }

  private _osVersion: number = 0;

  public get osVersion(): number {
    return this._osVersion;
  }

  async getOsVersion(): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      const info = await Device.getInfo()
      if (info.platform === 'android' || info.platform === 'ios') {
        const version = parseFloat(info.osVersion || '0');
        this._osVersion = isNaN(version) ? 0 : version;
      } else {
        this._osVersion = 0;
      }
      resolve(this._osVersion);
    });
  }

  public async getSettings(): Promise<ISettings> {
    let sessionSettings = await this._storageService.get('userSettings');
    if (sessionSettings) {
      return new Promise<any>((resolve, reject) => {
        resolve(JSON.parse(atob(sessionSettings)));
      });
    }
    else {
      return new Promise<any>((resolve, reject) => {
        resolve(null);
      });
    }
  }

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

export interface ISettings {
   radius: Number;
    calcMethod: Number;
    school: Number;
    notificationsEnabled?: boolean;
    currentLocation?: any;
}
