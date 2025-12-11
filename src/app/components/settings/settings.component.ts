import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { LoaderService } from 'src/app/core/services/loader.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { LocationService } from 'src/app/services/location.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PopupService } from 'src/app/services/popup.service';
import { AlAdhanOptions } from 'src/app/services/salaah-times.service';
import {
  ISettings,
  SettingsService,
  SettingType,
} from 'src/app/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  constructor(
    private _popupService: PopupService,
    private _locationService: LocationService,
    private _settingsService: SettingsService,
    private _loaderService: LoaderService,
    private _storage: StorageService,
    private _notificationService: NotificationService
  ) { }
  public radii = [1000, 2000, 3000];
  public settings: ISettings = {
    radius: 2000,
    calcMethod: 4,
    school: 0,
    notificationsEnabled: false,
    currentLocation: this._locationService.currentLocation,
  };
  private _originalSettings: any;
  public osVersion: number = this._settingsService.osVersion;

  async ngOnInit() {
    const sessionSettings = await this._storage.get('userSettings')
    if (sessionSettings)
      this.settings = JSON.parse(atob(sessionSettings));
    //update notification setting based on existing notifications
    const pendingNotifs = await this._notificationService.getPendingNotifications();
    this.settings.notificationsEnabled = pendingNotifs && pendingNotifs.notifications && pendingNotifs.notifications.length > 0;
    if (this.settings.notificationsEnabled) {
      this._notificationService.cancelPastNotifications();
    }
    ///
    this._originalSettings = _.cloneDeep(this.settings);
    const _popupSubscription = this._popupService.dismissEvent.subscribe(async (obj: any) => {
      _popupSubscription.unsubscribe();
      this.hide(obj);
    });
  }

  compareFn(e1: any, e2: any): boolean {
    return e1 && e2 ? e1.id == e2.id : e1 == e2;
  }

  public handleChange(ev: any) {
    ///
  }
  public async hide(backHandlerObj?: any) {
    const compareresult = this._compareSavedSettings();
    if (compareresult) {
      const alert = {
        header: 'Save Settings?',
        message: 'You have unsaved changes in settings. Would you like to save them?',
        buttons: [
          {
            text: 'Save',
            role: 'confirm',
            cssClass: 'alert-class',
            handler: () => {
              backHandlerObj?.backHandler();
              this._popupService.closePopups();
              this.saveSettings();
            }
          },
          {
            text: 'Discard',
            role: 'cancel',
            cssClass: 'alert-class',
            handler: () => {
              backHandlerObj?.backHandler();
              this._popupService.closePopups();
            }
          }
        ]
      }
      this._popupService.showConfirmationAlert(alert);
    }
    else {
      await this._popupService.closePopups();
    }
  }
  private _compareSavedSettings(): boolean {
    return !_.isEqual(this.settings, this._originalSettings);
  }

  public async saveSettings() {
    if (this.settings) {
      try {
        this._showLoaderWithMessage('Updating settings...', true);
        this._storage.remove('userSettings')
        await this._storage.set('userSettings', btoa(JSON.stringify(this.settings)))
        //create salaah notifications if enabled
        if (this.settings.notificationsEnabled) {
          const d = new Date();
          const salaahNotifs: AlAdhanOptions = {
            location: {
              lat: this._locationService.currentLocation.latitude,
              lng: this._locationService.currentLocation.longitude
            },
            today: d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear(),
            method: this.settings.calcMethod,
            school: this.settings.school,
          };
          await this._notificationService.scheduleSalaahNotifications(salaahNotifs);
        }
        else {
          //remove existing salaah notifications
          await this._notificationService.cancelAllNotifications();
        }
        this._originalSettings = _.cloneDeep(this.settings);
        const token = await this._storage.get('token');
        if (token)
          this._updateSettingsForUser();
        else
          this._showLoaderWithMessage('Settings updated successfully', false, 1500, true, true);
      }
      catch (err) {
        console.error(err);
      }
    }
  }

  private _updateSettingsForUser() {
    this._settingsService
      .updateSettings(this.settings, SettingType.SETTINGS)
      .then((res) => {
        this._showLoaderWithMessage('Settings updated successfully', false, 1500, true, true);
      }, (err) => {
        if (this._accessdeniedError(err)) return;
      });
  }

  private _showLoaderWithMessage(msg: string, ShowSpinner: boolean = false, timeout?: number, hideMe: boolean = false, resetLocation: boolean = false) {
    this._loaderService.hideLoader();
    this._loaderService.LoaderMessage = msg;
    this._loaderService.ShowSpinner = ShowSpinner;
    this._loaderService.showLoader();
    if (hideMe) {
      this._popupService.closePopups();
    }
    if (timeout) {
      setTimeout(() => {
        if (resetLocation) {
          this._locationService.resetLocation();
        }
        else {
          this._loaderService.hideLoader();
        }
      }, timeout);
    }
  }
  private _accessdeniedError(err: any): boolean {
    if (
      err.status === 401 ||
      (typeof err.error == 'string' &&
        err.error?.toLowerCase().indexOf('access denied') > -1)
    ) {
      this._loaderService.hideLoader();
      this._popupService.closePopups();
      this._logOut();
      this._loaderService.LoaderMessage =
        'it has been a while since you have logged in. Please log in again.';
      this._loaderService.ShowSpinner = false;
      this._loaderService.showLoader();
      setTimeout(() => {
        this._loaderService.hideLoader();
      }, 3500);
      return true;
    }
    return false;
  }
  private _logOut() {
    this._storage.clear();
    sessionStorage.clear();
  }

  public async locateMe(event?: any, override: boolean = false) {
    try {
      if (!event) {
        return;
      }
      const notificationsEnabled = await this._notificationService.requestPermission();
      if (!notificationsEnabled) {
        this.settings.notificationsEnabled = false;
        this._showLoaderWithMessage('Notifications permission denied', false, 1000);
        return;
      }
      if (this.settings.currentLocation && this.settings.currentLocation.city && !override) {
        return;
      }
      this._showLoaderWithMessage('Locating you...', true);
      let _self = this;
      const city = this._locationService.getCity().subscribe({
        async next() {
          //set the location in settings as the city is fetched based on current location
          _self.settings.currentLocation = _self._locationService.currentLocation;
          city.unsubscribe();
          _self._showLoaderWithMessage('Location updated successfully', false, 1300, false, false);
        },
        error(err) {
          console.error(err);
          _self._showLoaderWithMessage('Could not fetch your location', false, 1300);
        }
      });
    }
    catch (err) {
      console.error(err);
      this._showLoaderWithMessage('Could not fetch your location', false, 2000);
    }
  }

  //region Notification test
  public async getNotifications() {
    const notifs = (await this._notificationService.getPendingNotifications()).notifications;
    const res = notifs?.sort((a, b) => a.id - b.id)[0];
    this._popupService.showToast(`Next: ${JSON.stringify(res.title)}:${JSON.stringify(res.schedule?.at)}, left: ${notifs.length}`, 'middle', 1000, 'happy');
  }
  public async setTempNotification() {
    const notificationObj = await this._notificationService.scheduleNotification();
  }
  //endregion
}

