import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { FlmnuComponent } from '../components/flmnu/flmnu.component';
import { MapComponent } from '../components/map/map.component';
import { DescPopupComponent } from '../components/desc-popup/desc-popup.component';
import { LoaderComponent } from '../components/loader/loader.component';
import { LoginComponent } from '../components/login/login.component';
import { UserProfileComponent } from '../components/user-profile/user-profile.component';
import { SettingsComponent } from '../components/settings/settings.component';
import { TimingWidjetComponent } from '../components/timing-widjet/timing-widjet.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule],
  declarations: [
    HomePage,
    FlmnuComponent,
    MapComponent,
    DescPopupComponent,
    LoaderComponent,
    LoginComponent,
    UserProfileComponent,
    SettingsComponent,
    TimingWidjetComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePageModule {}
