import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/core/services/storage.service';
import { LocationService } from 'src/app/services/location.service';
import {
  SalaahTimesService,
  AlAdhanOptions,
} from 'src/app/services/salaah-times.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-timing-widjet',
  templateUrl: './timing-widjet.component.html',
  styleUrls: ['./timing-widjet.component.scss'],
})
export class TimingWidjetComponent implements OnInit {
  constructor(
    private _settingsService: SettingsService,
    private _salaahTimesService: SalaahTimesService,
    private _locationService: LocationService,
    private _storage: StorageService
  ) {}

  public showLoader: boolean = true;
  private currentLocaton: any;
  public hijriDate!: string;
  public stbArray: any[] = [];
  public osVersion: number = 0;
  ngOnInit() {
    this._locationService.LocatonChangedEvent.subscribe((res) => {
      if (res) {
        this.currentLocaton = res;
        this.getSalaahTimes();
        this.osVersion = this._settingsService.osVersion;
      }
    });
  }
  async getSalaahTimes() {
    let d = new Date();
    const sessionSettings = await this._storage.get('userSettings');
    let school = 1;
    let method = 1;
    if (sessionSettings) {
      school = JSON.parse(atob(sessionSettings)).school;
      method = JSON.parse(atob(sessionSettings)).calcMethod;
    }
    let salaahTimesOptions: AlAdhanOptions = {
      location: {
        lat: this.currentLocaton.latitude,
        lng: this.currentLocaton.longitude,
      },
      today: d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear(),
      method: method,
      school: school,
    };
    this._salaahTimesService
      .getSalaahTimes(salaahTimesOptions)
      .subscribe((data: any) => {
        this.stbArray = [];
        let times = data.data.timings;
        delete times.Sunrise;
        delete times.Sunset;
        delete times.Imsak;
        delete times.Firstthird;
        delete times.Lastthird;
        delete times.Midnight;
        this.hijriDate = `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`;
        Object.keys(times).forEach((key, index) => {
          this.stbArray.push({ name: key, val: times[key] });
        });
        this._salaahTimesService.salaahTimes = times;
        this.showLoader = false;
      });
  }
}
