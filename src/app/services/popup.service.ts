import { EventEmitter, Injectable } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { SettingsComponent } from '../components/settings/settings.component';
import { UserProfileComponent } from '../components/user-profile/user-profile.component';
import { LoginComponent } from '../components/login/login.component';
import { DescPopupComponent } from '../components/desc-popup/desc-popup.component';
import { MnmHelpComponent } from '../components/mnm-help/mnm-help.component';
import { StorageService } from '../core/services/storage.service';
import { AlertController } from '@ionic/angular';
import { MnmConstants } from '../core/mnm-constants';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private _pages = _.cloneDeep(MnmConstants.pages);;
  constructor(private _modalCtrl: ModalController, private _storage: StorageService, private alertCtrl: AlertController, private _toastCtrl: ToastController,) {
    this._pages = _.cloneDeep(MnmConstants.pages);
  }
  public modal!: HTMLIonModalElement;
  public dismissEvent: EventEmitter<any> = new EventEmitter<any>();

  public async showMasjidDesc(masjid: any) {
    this.modal = await this._modalCtrl.create({
      breakpoints: [0, 0.3, 0.4, 0.5, 0.8],
      initialBreakpoint: 0.4,

      component: DescPopupComponent,
      componentProps: { masjid: masjid },
    });
    await this.modal.present();
  }

  public async showLogin() {
    const userProfile = await this._storage.get('userProfile');
    if (userProfile) {
      this.showProfile();
    }
    this.modal = await this._modalCtrl.create({
      component: LoginComponent,
    });
    this.modal.isOpen = true;
    this._pages.find(p => p.name === 'Users')!.isOpen = true;
    await this.modal.present();
  }

  public async showHelp() {
    this.modal = await this._modalCtrl.create({
      component: MnmHelpComponent,
    });
    this.modal.isOpen = true;
    this._pages.find(p => p.name === 'Help')!.isOpen = true;
    await this.modal.present();
  }

  public async showProfile() {
    this.modal = await this._modalCtrl.create({
      component: UserProfileComponent,
    });
    this.modal.isOpen = true;
    this._pages.find(p => p.name === 'Profile')!.isOpen = true;
    await this.modal.present();
  }

  public async showSettings() {
    this.modal = await this._modalCtrl.create({
      component: SettingsComponent,
    });
    this.modal.isOpen = true;
    this._pages.find(p => p.name === 'Settings')!.isOpen = true;
    await this.modal.present();
  }

  public hasOpenPopups(): any {
    if (this.modal && this.modal.isOpen)
      return { modalObj: this.modal, popupObj: this._pages.filter(p => p.isOpen)[0] };
    else return null;
  }

  public async closeDesc() {
    await this.modal.dismiss();
  }

  public async closePopups() {
    await this.modal.dismiss();
    this.modal.isOpen = false;
    this._pages.forEach(p => { p.isOpen = false; });
  }

  async showConfirmationAlert(alert: any): Promise<boolean> {
    const alertEl = await this.alertCtrl.create(alert);
    await alertEl.present();
    const result = await alertEl.onDidDismiss();
    return result.role === 'confirm';
  }

  public getActivePopup() {
    return this._pages.filter(p => p.isOpen)[0]; // Assuming you have a property to track the active popup
  }

  public async showToast(message: string, position: 'top' | 'middle' | 'bottom' = 'middle', duration:number=2000, iconNme: string = 'close-outline') {
    let _toastElement!: HTMLIonToastElement;
    _toastElement = await this._toastCtrl.create({
      message: message,
      duration: duration,
      position: position,
      icon: iconNme,
      cssClass: 'toastClass',
      color: 'light',
    });
    await _toastElement.present();
  }
}
