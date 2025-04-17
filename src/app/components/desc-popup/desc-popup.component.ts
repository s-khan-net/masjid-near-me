import { Component, Input, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { IMasjid } from 'src/app/models/masjids.model';
import { PopupService } from 'src/app/services/popup.service';
import { SalaahTimesService } from 'src/app/services/salaah-times.service';
import { Share } from '@capacitor/share';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MasjidService } from 'src/app/services/masjid.service';
import { LocationService } from 'src/app/services/location.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-desc-popup',
  templateUrl: './desc-popup.component.html',
  styleUrls: ['./desc-popup.component.scss'],
})
export class DescPopupComponent implements OnInit {
  @Input() masjid!: IMasjid;
  public masjidCopy!: IMasjid;

  constructor(
    private _popupService: PopupService,
    private _platform: Platform,
    private _salahTimesService: SalaahTimesService,
    private _loaderService: LoaderService,
    private _masjidService: MasjidService,
    private _locationService: LocationService,
    private _storage: StorageService
  ) {}

  public salaahTimesAvailable: boolean = false;
  public editing: boolean = false;
  public userRole: any;
  async ngOnInit() {
    this.masjidCopy = _.cloneDeep(this.masjid);
    this.masjidCopy.masjidTimings.maghrib =
      this._salahTimesService.salaahTimes['Maghrib'];

    this.salaahTimesAvailable = this._checkAlltimesAvailable();
    const role = await this._storage.get('userRole');// sessionStorage.getItem('userRole');
    if (role) this.userRole = JSON.parse(atob(role));
    else this.userRole = { roleName: '' };
  }
  private _checkAlltimesAvailable(): boolean {
    return !!(
      this.masjid.masjidTimings &&
      this.masjid.masjidTimings.fajr &&
      this.masjid.masjidTimings.zuhr &&
      this.masjid.masjidTimings.asr &&
      this.masjid.masjidTimings.maghrib &&
      this.masjid.masjidTimings.isha &&
      this.masjid.masjidTimings.jumah
    );
  }

  public dismiss() {
    this._popupService.closePopups();
  }

  public navigate() {
    let destination =
      this.masjid.masjidLocation.coordinates[1] +
      ',' +
      this.masjid.masjidLocation.coordinates[0];

    if (this._platform.is('ios')) {
      window.open('maps://?q=' + destination, '_system');
    } else {
      let label = encodeURI(this.masjid.masjidName);
      window.open('geo:0,0?q=' + destination + '(' + label + ')', '_system');
    }
  }

  public editClick() {
    this.editing = !this.editing;
    if (!this.editing) {
      this.dismiss();
      this.masjidCopy = _.cloneDeep(this.masjid);
    }
  }
  public async share() {
    var u = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${this.masjid.masjidAddress.googlePlaceId}`;
    let name = this.masjid.masjidName.replace(/_/g, ' ');
    await Share.share({
      title: `Sharing ${name}`,
      text: u,
      url: u,
      dialogTitle: `Sharing ${name}`,
    });
  }
  public timeChanged(e: any, salaah: keyof IMasjid['masjidTimings']) {
    this.masjidCopy.masjidTimings[salaah] = e.detail.value
      .split('T')[1]
      .substring(0, 5);
  }

  public signIn() {
    this.dismiss();
    this.masjidCopy = _.cloneDeep(this.masjid);
    this._popupService.showLogin();
  }

  public saveClick() {
    console.log('save this- >', JSON.stringify(this.masjidCopy));
    this._loaderService.hideLoader();
    this._loaderService.LoaderMessage = 'Saving masjid details';
    this._loaderService.ShowSpinner = true;
    this._loaderService.showLoader();
    //update masjid
    this._updateMasjid();
  }

  public verifyMasjid(res: boolean): void {
    console.log('Masjid verified', this.masjidCopy);
    this._loaderService.hideLoader();
    this._loaderService.LoaderMessage = 'Getting masjid details';
    this._loaderService.ShowSpinner = true;
    this._loaderService.showLoader();
    if (res) {
      this.masjidCopy.verified = true;
    } else {
      this.masjidCopy.notMasjid = true;
    }
    //get masjid details from placeId
    this._masjidService
      .getMasjidDetails(this.masjidCopy.masjidAddress.googlePlaceId)
      .subscribe({
        next: (res) => {
          if (res) {
            const masjidWithDetails = JSON.parse(JSON.stringify(res));
            this.masjidCopy.masjidAddress = masjidWithDetails.masjidAddress;
          }
          this._loaderService.hideLoader();
          this._updateMasjid();
        },
        error: (err) => {
          if (this._accessdeniedError(err)) return;
          this._loaderService.hideLoader();
          this._loaderService.LoaderMessage = 'Masjid update failed';
          this._loaderService.ShowSpinner = false;
          this._loaderService.showLoader();
          setTimeout(() => {
            this._loaderService.hideLoader();
          }, 4500);
        },
      });
  }

  private _updateMasjid() {
    this._loaderService.LoaderMessage = 'Updating masjid details';
    this._loaderService.ShowSpinner = true;
    this._loaderService.showLoader();
    this._masjidService.updateMasjid(this.masjidCopy).then(
      (res: any) => {
        if (res) {
          this._loaderService.hideLoader();
          this._loaderService.LoaderMessage = 'Masjid updated successfully';
          this._loaderService.ShowSpinner = false;
          this._loaderService.showLoader();
          this.dismiss();
          setTimeout(() => {
            this._loaderService.hideLoader();
            this._locationService.resetLocation();
          }, 4500);
        }
      },
      (err) => {
        if (this._accessdeniedError(err)) return;
        this._loaderService.hideLoader();
        this._loaderService.LoaderMessage = 'Masjid update failed';
        this._loaderService.ShowSpinner = false;
        this._loaderService.showLoader();
        setTimeout(() => {
          this._loaderService.hideLoader();
        }, 4500);
      }
    );
    this.editing = false;
    this.dismiss();
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
      }, 5000);
      return true;
    }
    return false;
  }

  private _logOut() {
    this._storage.clear();
    sessionStorage.clear();
  }
}
