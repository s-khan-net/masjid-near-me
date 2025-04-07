import { Component, OnInit } from '@angular/core';
import {
  IonToast,
  MenuController,
  NavController,
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

  private _toastElement!: HTMLIonToastElement;
  constructor(
    private _navCtrl: NavController,
    private _locationService: LocationService,
    private _mnuCtrl: MenuController,
    private _popupService: PopupService,
    private _platform: Platform,
    private _toastCtrl: ToastController
  ) {}
  ngOnInit(): void {
    if (this._platform.is('android')) {
      this._checkLocation();
      this._platform.backButton.subscribe(async (val) => {
        if (this._popupService.hasOpenPopups()) {
          this._popupService.closePopups();
        } else {
          this._toastElement = await this._toastCtrl.create({
            message: 'Press back again to exit',
            duration: 2000,
            position: 'bottom',
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
      });
    } else {
      this._navigateToDashboard();
    }
  }

  public menuWillOpen() {
    this.setUserName();
  }

  private setUserName() {
    const userProfile = sessionStorage.getItem('userProfile');
    this.mnuItems = _.cloneDeep(MnmConstants.menuItems);
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

  private async setCurrentLocation(): Promise<void> {
    const position = await Geolocation.getCurrentPosition();
    if (position) {
      this._locationService.currentLocation = {
        latitude: 12.929502, //position.coords.latitude,
        longitude: 77.586098, // position.coords.longitude,
        //to set the location on startup then declare as below
        // lt = 21.16980812743961; // mysuru
        // ln = 79.0795353478851;
        // lt = 12.929502; //Bangalore,
        // ln = 77.586098;
        // var lt = 52.504859; //Birmingham UK
        // var ln = -1.863434;
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
        const toast = await this._toastCtrl.create({
          duration: 2000,
          message: 'Coming soon',
          position: 'middle',
          cssClass: 'toastClass',
          color: 'light',
        });

        await toast.present();
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
    console.log('close menu');
    this._mnuCtrl.close();
  }

  public onMenuOpen(): void {
    console.log('opening');
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
    //check if user is logged in
    this.setUserName();
    let intervalcounter = 0;
    let interval = setInterval(() => {
      intervalcounter++;
      if (this._locationService.mapLoaded) {
        clearInterval(interval);
        this.showSplash = false;
        this._checkNetwork();
      }
      else {
        this.splashText = 'Loading map... Please wait';
        if(intervalcounter>30){
          clearInterval(interval);
          this.splashText = 'Sorry, Unable to load map';
        }
        if(intervalcounter>3){
          this.splashTextExtra = 'This is taking a while...';
        }
        if(intervalcounter>5){
          this.splashTextExtra = 'Should be done soon...';
        }
        if(intervalcounter>10){
          this.splashTextExtra = 'This is taking longer than expected...';
        }
      }
    }, 1900);
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
