import { Injectable } from '@angular/core';
import { DataService } from '../core/services/dataservice.service';
import { Observable } from 'rxjs';
import { MnmConstants } from '../core/mnm-constants';

@Injectable({
  providedIn: 'root',
})
export class SalaahTimesService {
  constructor(private _dataService: DataService) {}
  private _salaahTimes:any;
  public get salaahTimes() {
    return this._salaahTimes;
  }
  public set salaahTimes(value){
    this._salaahTimes = value;
  }

  getSalaahTimes(options:AlAdhanOptions): Observable<any> {
    const url = `${MnmConstants.alAdhanTimingsPath}${options.today}?latitude=${options.location.lat}&longitude=${options.location.lng}&method=${options.method}&school=${options.school}`
    return this._dataService.getData(url)
  }
}

export interface AlAdhanOptions {
  location:{
    lat:any,
    lng:any
  },
  today:any,
  method:any,
  school:any
}
