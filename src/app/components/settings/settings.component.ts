import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/core/services/loader.service';
import { LocationService } from 'src/app/services/location.service';
import { PopupService } from 'src/app/services/popup.service';
import {
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
    private _loaderService: LoaderService
  ) {}
  public radii = [1000, 2000];
  public settings = {
    radius: 2000,
    calcMethod: 2,
    school: 0,
  };
  ngOnInit() {
    let sessionSettings = sessionStorage.getItem('userSettings');
    if (sessionSettings) {
      this.settings = JSON.parse(atob(sessionSettings));
    }
  }

  compareFn(e1: any, e2: any): boolean {
    return e1 && e2 ? e1.id == e2.id : e1 == e2;
  }

  public handleChange(ev: any) {
    ///
  }
  public hide() {
    this._popupService.closePopups();
  }

  public saveSettings() {
    if (this.settings) {
      this._loaderService.hideLoader();
      this._loaderService.LoaderMessage = 'Loading';
      this._loaderService.ShowSpinner = true;
      this._loaderService.showLoader();
      sessionStorage.removeItem('userSettings');
      sessionStorage.setItem(
        'userSettings',
        btoa(JSON.stringify(this.settings))
      );
      this._settingsService
        .updateSettings(this.settings, SettingType.SETTINGS)
        .then(
          (res) => {
            if (res) {
              this._loaderService.hideLoader();
              this._loaderService.LoaderMessage =
                'Settings updated successfully';
              this._loaderService.ShowSpinner = false;
              this._loaderService.showLoader();
              this.hide();
              setTimeout(() => {
                this._loaderService.hideLoader();
                this._locationService.resetLocation();
              }, 4500);
            }
          },
          (err) => {
            if (this._accessdeniedError(err)) return;
          }
        );
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
      this._loaderService.LoaderMessage =
        'it has been a while since you have logged in. Please log in again.';
      this._loaderService.ShowSpinner = false;
      this._loaderService.showLoader();
      setTimeout(() => {
        this._loaderService.hideLoader();
      }, 5000);
      return true;
    }
    return false;
  }
}
