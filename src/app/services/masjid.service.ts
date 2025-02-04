import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../core/services/dataservice.service';
import { IMasjid } from '../models/masjids.model';
import { MnmConstants } from '../core/mnm-constants';

@Injectable({
  providedIn: 'root'
})
export class MasjidService {

  constructor(private _dataService: DataService) { }

  public getMasjids(lt: number, ln: number, radius: number, limit: number): Observable<IMasjid[]> {
    if (!radius)
      radius = 2000;
    if (!limit)
      limit = 20;
    let url= `${MnmConstants.baseUrl}${MnmConstants.masjidMidPath}${lt}/${ln}/${radius}/${limit}`
    return this._dataService.getData(url)
  }
}
