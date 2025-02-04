import { Component, OnInit } from '@angular/core';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  constructor(private _popupService: PopupService) {}

  public email: string = '';
  public userProfile: any;
  public role: any;

  ngOnInit() {
    const sessionProfile = sessionStorage.getItem('userProfile');
    const sessionRole = sessionStorage.getItem('userRole');
    this.email = sessionStorage.getItem('userEmail') || '';
    if (sessionProfile && sessionRole) {
      this.userProfile = JSON.parse(atob(sessionProfile));
      this.role = JSON.parse(atob(sessionRole));
    }
  }
  public hide() {
    this._popupService.closePopups();
  }
  public logOut() {
    sessionStorage.clear();
    this.hide();
  }
}
