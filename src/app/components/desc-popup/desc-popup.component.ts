import { Component, Input, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { IMasjid } from 'src/app/models/masjids.model';
import { PopupService } from 'src/app/services/popup.service';
import { SalaahTimesService } from 'src/app/services/salaah-times.service';
import { Share } from '@capacitor/share';

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
    private _salahTimesService: SalaahTimesService
  ) {}

  public salaahTimesAvailable: boolean = false;
  public editing: boolean = false;
  public userRole: any;
  ngOnInit() {
    this.masjidCopy = _.cloneDeep(this.masjid);
    this.masjidCopy.masjidTimings.maghrib =
      this._salahTimesService.salaahTimes['Maghrib'];

    this.salaahTimesAvailable = this._checkAlltimesAvailable();
    const role = sessionStorage.getItem('userRole');
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
      let label = encodeURI('My Label');
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
  }
}
