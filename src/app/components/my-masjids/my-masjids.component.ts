import { Component, Input, OnInit } from '@angular/core';
import { StorageService } from 'src/app/core/services/storage.service';
import { IMasjid } from 'src/app/models/masjids.model';
import { PopupService } from 'src/app/services/popup.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-my-masjids',
  templateUrl: './my-masjids.component.html',
  styleUrls: ['./my-masjids.component.scss'],
})
export class MyMasjidsComponent implements OnInit {
  @Input() myMasjids!: IMasjid[];
  public osVersion: number = this._settingsService.osVersion;
  constructor(private _storage: StorageService, private _popupService: PopupService, private _settingsService: SettingsService, private _usersService: UsersService) { }
  async ngOnInit() {
    this.myMasjids = this.myMasjids ? this.myMasjids : [];
    console.log('My masjids:', this.myMasjids);
  }
  public removeFromMyMasjids(masjid: IMasjid) {
    const alert = {
      header: 'Remove from My Masjids',
      message: 'Do you want to remove this masjid from your masjids list?',
      buttons: [
        {
          text: 'Yes',
          role: 'confirm',
          cssClass: 'alert-class',
          handler: () => {
            this._removeFromMyMasjids(masjid);
          }
        },
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'alert-class',
          handler: () => {
            console.log('Not removing from my masjids');
          }
        }
      ]
    }
    this._popupService.showConfirmationAlert(alert);
  }
  private async _removeFromMyMasjids(masjid: IMasjid) {
    const googlePlaceId = masjid.masjidAddress.googlePlaceId;
    const myMasjidsList = await this._storage.get('myMasjids');
    let myMasjids = myMasjidsList ? JSON.parse(atob(myMasjidsList)) : [];
    myMasjids = myMasjids.filter((m: any) => m.masjidAddress.googlePlaceId !== googlePlaceId);
    this._storage.set('myMasjids', btoa(JSON.stringify(myMasjids)));
    this.myMasjids = myMasjids;
    this._updateMyMasjids(myMasjids).then(() => {
      this._popupService.showToast('Masjid removed from My Masjids', 'bottom', 2000, 'checkmark-outline');
    }).catch(() => {
      this._popupService.showToast('Failed to remove masjid from My Masjids', 'bottom', 2000, 'close-outline');
    });
  }
  private async _updateMyMasjids(myMasjidsList: any[]) {
    if (myMasjidsList.length > 0) {
      const myMasjidsListForUpdate = myMasjidsList.map((m: any) => m._id);
      this._usersService.updateMyMasjidsForUser(myMasjidsListForUpdate).then((res) => {
        if (res) {
          console.log('My Masjids updated for user');
        } else {
          console.log('Failed to update My Masjids for user');
        }
      });
    }
  }

  public hide() {
    this._popupService.closePopups();
  }
}
