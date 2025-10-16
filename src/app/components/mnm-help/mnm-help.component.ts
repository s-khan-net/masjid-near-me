import { Component, OnInit } from '@angular/core';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-mnm-help',
  templateUrl: './mnm-help.component.html',
  styleUrls: ['./mnm-help.component.scss'],
})
export class MnmHelpComponent implements OnInit {

  constructor(private _popupService: PopupService) { }

  ngOnInit() {}
  public hide() {
    this._popupService.closePopups();
  }
}
