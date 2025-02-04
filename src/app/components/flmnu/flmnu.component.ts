import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { MenuController, ModalController } from '@ionic/angular';
import { IMasjid } from '../../models/masjids.model';
import { DescPopupComponent } from '../desc-popup/desc-popup.component';
import { PopupService } from 'src/app/services/popup.service';
import { LocationService } from 'src/app/services/location.service';

@Component({
  animations: [
    trigger('flmnu', [
      state(
        'farin',
        style({
          right: '-255px',
        })
      ),
      state(
        'initial',
        style({
          right: '-219px',
        })
      ),
      state(
        'final',
        style({
          right: '-1px',
        })
      ),
      transition('farin=>final', animate('300ms')),
      transition('initial=>final', animate('300ms')),
      transition('final=>initial', animate('300ms')),
    ]),
  ],
  selector: 'app-flmnu',
  templateUrl: './flmnu.component.html',
  styleUrls: ['./flmnu.component.scss'],
})
export class FlmnuComponent implements OnChanges {
  public currentState: string = 'initial';
  @Input() public masjids!: IMasjid[];
  @Output() public setCamera = new EventEmitter();
  constructor(private _popupService: PopupService, private _locationService: LocationService,) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.masjids) {
      this.currentState = 'farin';
    } else {
      this.currentState = 'initial';
    }
  }

  ngOnInit() {
    this._locationService.LocatonChangedEvent.subscribe((res) => {
      if(res) this.masjids = []
    })
  }

  public toggleFlmnu(): void {
    this.currentState = this.currentState === 'initial' ? 'final' : 'initial';
  }

  public selectMasjid(masjid: IMasjid): void {
    this.currentState = 'initial';
    const obj = {
      mapId: 'mnm-map',
      markerId: masjid.markerId || '1',
      latitude: masjid.masjidLocation.coordinates[1],
      longitude: masjid.masjidLocation.coordinates[0],
      title: masjid.masjidName,
      snippet: '',
    };
    this.setCamera.emit(obj);
  }
}
