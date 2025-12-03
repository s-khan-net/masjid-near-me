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

  getTimes(options:AlAdhanOptions, duration?: number): Observable<any> {
    let d = new Date();
    d.setDate(d.getDate() + (duration ? duration : 19));
    const toDate = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();
    const url = `${MnmConstants.alAdhanCalendarPath}from/${options.today}/to/${toDate}?latitude=${options.location.lat}&longitude=${options.location.lng}&method=${options.method}&school=${options.school}`
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
