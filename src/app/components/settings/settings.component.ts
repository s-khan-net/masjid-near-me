import { Component, OnInit } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  constructor(
    private _popupService: PopupService,
    private _locationService: LocationService
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
      sessionStorage.removeItem('userSettings');
      sessionStorage.setItem(
        'userSettings',
        btoa(JSON.stringify(this.settings))
      );
      this._locationService.resetLocation();
      this.hide();
    }
  }
}
