import { Component, OnInit } from '@angular/core';
import { PopupService } from 'src/app/services/popup.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-mnm-help',
  templateUrl: './mnm-help.component.html',
  styleUrls: ['./mnm-help.component.scss'],
})
export class MnmHelpComponent implements OnInit {

  constructor(private _popupService: PopupService, private _settingsService: SettingsService) { }

  public osVersion: number = this._settingsService.osVersion;

  ngOnInit() {}
  public hide() {
    this._popupService.closePopups();
  }
}
