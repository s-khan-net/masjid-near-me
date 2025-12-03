import { Component, OnInit } from '@angular/core';
import {
  MenuController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { IMasjid } from '../models/masjids.model';
import { LocationService } from '../services/location.service';
import { PopupService } from '../services/popup.service';
import { MnmConstants } from '../core/mnm-constants';
import { Geolocation } from '@capacitor/geolocation';
import * as _ from 'lodash';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';
import { AndroidSettings, NativeSettings } from 'capacitor-native-settings';
import { Network } from '@capacitor/network';
import { StorageService } from '../core/services/storage.service';
import { ISettings, SettingsService } from '../services/settings.service';
import { NotificationService } from '../services/notification.service';
import { AlAdhanOptions } from '../services/salaah-times.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  private _exitArray = 1;
  public connected: boolean = true;
  public masjids!: IMasjid[];
  public currentLocaton!: { latitude: number; longitude: number };
  public mnuItems: any;
  public showSplash: boolean = true;
  public locationPermissionFailed: boolean = true;
  public isLocationEnabled: boolean = true;
  public splashText: string = 'Initializing...';
  public splashTextExtra: string = '';
  public version: string = '3.3.001';
  public osVersion: number = 0;
  public showingAppVersion: boolean = false;

  private _toastElement!: HTMLIonToastElement;
  constructor(
    private _locationService: LocationService,
    private _mnuCtrl: MenuController,
    private _popupService: PopupService,
    private _platform: Platform,
    private _toastCtrl: ToastController,
    private _storage: StorageService,
    private _settingsService: SettingsService,
    private _notificationService: NotificationService
  ) { }
  async ngOnInit(): Promise<void> {
    if (this._platform.is('android')) {
      this.osVersion = await this._settingsService.getOsVersion();
      this._checkLocation();
      this._checkNetwork();
      this._platform.backButton.subscribeWithPriority(9999, async (processNextHandler) => {
        const popup = this._popupService.hasOpenPopups()
        if (popup) {
          if (popup.popupObj.name === 'Settings') {
            this._popupService.dismissEvent.emit({ popup: popup, backHandler: processNextHandler });
          }
          else {
            await this._popupService.closePopups();
          }
        } else {
          await this._exitApp();
        }
      });
    } else {
      this._navigateToDashboard();
    }
  }

  private async _exitApp() {
    this._toastElement = await this._toastCtrl.create({
      message: 'Press again to exit',
      duration: 2000,
      position: 'bottom',
      icon: 'close-outline',
      cssClass: 'toastClass',
      color: 'light',
    });
    setTimeout(() => {
      this._exitArray++;
    }, 2000);
    if (this._exitArray == 0) {
      await this._toastElement.dismiss();
      App.exitApp();
    } else {
      this._exitArray--;
      await this._toastElement.present();
    }
  }

  public menuWillOpen() {
    this.setUserName(true);
  }

  private async setUserName(mnuOpened?: boolean) {
    const userProfile = await this._storage.get('userProfile'); //sessionStorage.getItem('userProfile');
    /** here the token is taken from the storage and saved inn the sessionstorage
     * so user login is maintained in the app
     */
    const token = await this._storage.get('token');

    this.mnuItems = _.cloneDeep(MnmConstants.menuItems);
    if (mnuOpened) {
      if (userProfile) {
        const name = JSON.parse(atob(userProfile))?.firstName;
        this.mnuItems.filter((x: any) => {
          if (x.name == 'Users') {
            x.name = name;
          }
        });
      } else {
        this.mnuItems = _.cloneDeep(MnmConstants.menuItems);
      }
    }
  }

  private async setCurrentLocation(): Promise<void> {
    const position = await Geolocation.getCurrentPosition();
    if (position) {
      this._locationService.currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        heading: position.coords.heading ? position.coords.heading : null
        //to set the location on startup then declare as below
        // latitude: 21.16980812743961, // mysuru
        // longitude: 79.0795353478851,
        // latitude: 12.929502, //Bangalore,
        // longitude: 77.586098,
        // latitude: 52.504859, //Birmingham UK
        // longitude: -1.863434,
      };
    } else {
      throw new Error('Position could not be found');
    }
  }

  public async menuClick(item: any): Promise<void> {
    switch (item.name) {
      case 'Settings':
        this._popupService.showSettings();
        break;
      case 'Compass':
        this._popupService.showToast('Coming soon', "middle", 2500, 'compass-outline')
        break;
      case 'Users':
        this._popupService.showLogin();
        break;
      case 'Share':
        await Share.share({
          title: 'Sharing Masjid near me',
          text: 'Find a Masjid near you. Locate all Masjids, get Salaah times, Find direction of Qiblah at your location.Download for Android:',
          url: 'https://play.google.com/store/apps/details?id=me.masjidnear',
          dialogTitle: 'Share with buddies',
        });
        break;
      case 'Help':
        this._popupService.showHelp();
        break;
      default:
        this._popupService.showProfile();
        break;
    }
    this.closeMenu();
  }

  public closeMenu(): void {
    this._mnuCtrl.close();
  }

  public showAppVersion() {
    setTimeout(() => {
      this.showingAppVersion = true;
      setTimeout(() => {
        this.showingAppVersion = false;
      }, 9000);
    }, 50);
    this.closeMenu();
  }

  public hideWhatsNew() {
    this.showingAppVersion = false;
  }

  //#region splashText
  private _checkLocation() {
    Geolocation.checkPermissions()
      .then((res) => {
        this.isLocationEnabled = true;
        if (res.location == 'granted') {
          this.splashText = 'Checking location... loading map';
          this._navigateToDashboard();
        } else {
          this.splashText = 'This app needs permission to use your location';
          this.requestLocationPermission();
        }
      })
      .catch((ex) => {
        this.splashText = 'Please start Location services on your device';
        setTimeout(() => {
          this.showLocationSettings();
        }, 1900);
      });
  }
  public requestLocationPermission() {
    //request permissions
    Geolocation.requestPermissions().then((res) => {
      if (res.location == 'granted') {
        this.locationPermissionFailed = true;
        this.splashText = 'Checking location... loading map';
        this._navigateToDashboard();
      } else {
        this.locationPermissionFailed = false;
        if (res.coarseLocation == 'denied' && res.location == 'denied') {
          NativeSettings.openAndroid({
            option: AndroidSettings.ApplicationDetails,
          }).then((val) => {
            //
          });
        }
      }
    });
  }

  private _navigateToDashboard() {
    this.setCurrentLocation();
    let intervalcounter = 0;
    let interval = setInterval(() => {
      intervalcounter++;
      if (this._locationService.mapLoaded) {
        clearInterval(interval);
        try {
          this._checkNotifications();
        }
        catch (ex) {
          this.splashText = 'Error loading notifications';
          setTimeout(() => {
            this.showSplash = false;
          }, 2000);
        }
      } else {
        this.splashText = 'Loading map... Please wait';
        if (intervalcounter > 30) {
          clearInterval(interval);
          this.splashText = 'Sorry, Unable to load map';
        }
        if (intervalcounter > 3) {
          this.splashTextExtra = 'This is taking a while...';
        }
        if (intervalcounter > 5) {
          this.splashTextExtra = 'Should be done soon...';
        }
        if (intervalcounter > 10) {
          this.splashTextExtra = 'This is taking longer than expected...';
        }
      }
    }, 1900);
  }
  private _checkNotifications() {
    this._notificationService.areEnabled().then(async (enabled) => {
      if (enabled) {
        await this._notificationService.cancelPastNotifications();
        const notifs = await this._notificationService.getPendingNotifications();
        if (notifs && notifs.notifications) {
          this.splashTextExtra = `You have ${notifs.notifications.length} pending notifications`;
          if (notifs.notifications.length < 20 && notifs.notifications.length > 0) {
            this.splashTextExtra = 'Scheduling salaah notifications...';
            const setNotifications = await this._scheduleSalaahNotfications();
            if (setNotifications) {
              this.splashTextExtra = 'Notifications are scheduled';
            }
            else {
              this.splashTextExtra = 'Go to Settings to manage prayer notifications.';
            }
            setTimeout(() => {
              this.showSplash = false;
            }, 1000);
          }
          else {
            if (notifs.notifications.length == 0) {
              this.splashTextExtra = 'Go to Settings to manage prayer notifications.';
            }
            else {
              this.splashTextExtra = 'Loading notifications...';
            }
            setTimeout(() => {
              this.showSplash = false;
            }, 2500);
          }
        }
      }
      else {
        await this._notificationService.cancelAllNotifications();
        this.splashTextExtra = 'Notifications are disabled. Go to Settings to enable them';
        setTimeout(() => {
          this.showSplash = false;
        }, 2500);
      }
    });
  }

  private async _scheduleSalaahNotfications() {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let settings: ISettings = {
          radius: 2000,
          calcMethod: 2,
          school: 0,
          notificationsEnabled: false,
          currentLocation: this._locationService.currentLocation,
        };
        const sessionSettings = await this._storage.get('userSettings')
        if (sessionSettings)
          settings = JSON.parse(atob(sessionSettings));
        const d = new Date();
        const salaahNotifs: AlAdhanOptions = {
          location: {
            lat: this._locationService.currentLocation.latitude,
            lng: this._locationService.currentLocation.longitude
          },
          today: d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear(),
          method: settings.calcMethod,
          school: settings.school,
        };
        this._notificationService.scheduleSalaahNotifications(salaahNotifs).then(async () => {
          const cancelNotifications = await this._notificationService.cancelPastNotifications();
          resolve(cancelNotifications);
        }).catch((err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  private _checkNetwork() {
    if (Network) {
      Network.getStatus().then((status) => {
        this.connected = status.connected;
      });
      Network.addListener('networkStatusChange', (status) => {
        this.connected = status.connected;
      });
    }
  }

  public showLocationSettings() {
    NativeSettings.openAndroid({ option: AndroidSettings.Location }).then(
      (locSetting) => {
        if (!locSetting.status) {
          this.isLocationEnabled = false;
        } else {
          this.splashText = 'Checking location...';
          this._checkLocation();
        }
      }
    );
  }
  //#endregion
}
