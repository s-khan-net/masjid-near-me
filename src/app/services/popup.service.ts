import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SettingsComponent } from '../components/settings/settings.component';
import { UserProfileComponent } from '../components/user-profile/user-profile.component';
import { LoginComponent } from '../components/login/login.component';
import { DescPopupComponent } from '../components/desc-popup/desc-popup.component';
import { MnmHelpComponent } from '../components/mnm-help/mnm-help.component';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  constructor(private _modalCtrl: ModalController) {}
  public modal!: HTMLIonModalElement;
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
    const userProfile = sessionStorage.getItem('userProfile');
    if (userProfile) {
      this.showProfile();
    }
    this.modal = await this._modalCtrl.create({
      component: LoginComponent,
    });
    await this.modal.present();
  }

  public async showHelp() {
    this.modal = await this._modalCtrl.create({
      component: MnmHelpComponent,
    });
    await this.modal.present();
  }

  public async showProfile() {
    this.modal = await this._modalCtrl.create({
      component: UserProfileComponent,
    });
    await this.modal.present();
  }

  public async showSettings() {
    this.modal = await this._modalCtrl.create({
      component: SettingsComponent,
    });
    await this.modal.present();
  }

  public hasOpenPopups(): boolean {
    return this.modal?.isOpen;
  }

  public closePopups() {
    this.modal.dismiss();
    this.modal.isOpen = false;
  }
}
