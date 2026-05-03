import { Component, Input, OnInit } from '@angular/core';
import { AndroidSettings, NativeSettings } from 'capacitor-native-settings';
import { LocationService } from 'src/app/services/location.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-reset-btn',
  templateUrl: './reset-btn.component.html',
  styleUrls: ['./reset-btn.component.scss'],
})
export class ResetBtnComponent implements OnInit {

  constructor(private _locationService: LocationService, private _loaderService: LoaderService, private _storage: StorageService) { }
  ngOnInit() { }


  public async resetLocation() {
    this._locationService.checkLocationPermission().then((res) => {
      if (res.location == 'granted') {
        this._loaderService.LoaderMessage = 'Resetting location';
        this._loaderService.ShowSpinner = true;
        this._loaderService.showLoader();
        this._resetLocation()
      } else {
        this._loaderService.hideLoader();
        this._locationService.requestLocationPermission().then((res) => {
          if (res.location == 'granted') {
            this._resetLocation()
          }
          else {
            this._loaderService.hideLoader();
            if (res.coarseLocation == 'denied' && res.location == 'denied') {
              NativeSettings.openAndroid({
                option: AndroidSettings.ApplicationDetails,
              }).then((val) => {
                if (!val.status)
                  alert('Please enable location permissions in settings');
                else
                  this._resetLocation();
              });
            }
          }
        })
      }
    }).catch((err) => {
      NativeSettings.openAndroid({ option: AndroidSettings.Location }).then(
        (locSetting) => {
          if (locSetting.status) {
            this._resetLocation()
          }
        });
    });
  }

  private async _resetLocation() {
    try {
      this._loaderService.LoaderMessage = 'Getting device location';
      this._loaderService.ShowSpinner = true;
      this._loaderService.showLoader();
      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds
        maximumAge: 0   // Force a fresh location
      };
      const position = await this._locationService.getNavigatorCurrentLocation(options)
      if (position) {
        this._loaderService.LoaderMessage = `Updating location`;
        this._locationService.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          dragged: false,
        };
        //store the location in storage for later use
        await this._storage.set('currentLocation', btoa(JSON.stringify(this._locationService.currentLocation)));
      }
    } catch (err) {
      alert('Error getting location: ' + JSON.stringify(err));
      this._loaderService.LoaderMessage = 'Unable to get location. Please ensure location services are enabled and try again.';
      this._loaderService.ShowSpinner = false;
      this._loaderService.showLoader();
      setTimeout(() => {
        this._loaderService.hideLoader();
      }, 2500);
    }
  }

}
