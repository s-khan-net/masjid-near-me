import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { IMasjid } from '../../models/masjids.model';
import { LocationService } from 'src/app/services/location.service';
import { MasjidService } from 'src/app/services/masjid.service';

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
export class FlmnuComponent implements OnInit {
  public currentState: string = 'initial';
  @Input() public masjids!: IMasjid[];
  @Output() public setCamera = new EventEmitter();
  constructor(
    private _masjidService: MasjidService,
    private _locationService: LocationService
  ) {}

  ngOnInit() {
    this._locationService.LocatonChangedEvent.subscribe((res) => {
      if (res) this.masjids = [];
    });
    this._masjidService.masjidsLoaded$.subscribe((obj) => {
      this.masjids = obj.masjids;
      const t = obj.dragged ? 1000 : 0;
      setTimeout(() => {
        this._toggleFLmnuInOut();
      }, t);
    });
  }

  private _toggleFLmnuInOut() {
    this.currentState = 'final';
    setTimeout(() => {
      this.currentState = 'initial';
    }, 1900);
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
