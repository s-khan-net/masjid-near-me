import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../core/services/dataservice.service';
import { IMasjid } from '../models/masjids.model';
import { MnmConstants } from '../core/mnm-constants';

@Injectable({
  providedIn: 'root'
})
export class MasjidService {
  updateMasjid(masjid: IMasjid):Promise<boolean> {
    return new Promise((resolve, reject) => {
      const url = `${MnmConstants.baseUrl}${MnmConstants.masjidMidPath}`;
      this._dataService.putService(url, { masjid }).subscribe((data) => {
        if (JSON.stringify(data)) {
          if (JSON.parse(JSON.stringify(data)).body.updated) {
            console.log('Masjid updated successfully');
            resolve(true);
          }
          else {
            console.log('Masjid update failed');
            reject(false);
          }
        } else {
          console.log('Masjid update failed');
          reject(false);
        }
      });
    });
  }

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
