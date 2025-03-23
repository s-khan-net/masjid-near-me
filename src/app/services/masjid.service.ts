import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DataService } from '../core/services/dataservice.service';
import { IMasjid } from '../models/masjids.model';
import { MnmConstants } from '../core/mnm-constants';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MasjidService {

  private masjidsLoaded = new Subject<{masjids:IMasjid[], dragged:boolean}>();
  masjidsLoaded$ = this.masjidsLoaded.asObservable();

  public getMasjids(lt: number, ln: number, radius: number, limit: number, dragged?:boolean): Observable<IMasjid[]> {
    if (!radius) radius = 2000;
    if (!limit) limit = 20;
    let url = `${MnmConstants.baseUrl}${MnmConstants.masjidMidPath}${lt}/${ln}/${radius}/${limit}`;
    return this._dataService.getData(url).pipe(
      tap((masjids: IMasjid[]) => this.masjidsLoaded.next({masjids: masjids, dragged: !!dragged}))
    );
  }

  getMasjidDetails(googlePlaceId: string):Observable<any> {
    const url = `${MnmConstants.baseUrl}${MnmConstants.masjidMidPath}details/${googlePlaceId}`;
    return this._dataService.getData(url)
  }
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

  // public getMasjids(lt: number, ln: number, radius: number, limit: number): Observable<IMasjid[]> {
  //   if (!radius)
  //     radius = 2000;
  //   if (!limit)
  //     limit = 20;
  //   let url= `${MnmConstants.baseUrl}${MnmConstants.masjidMidPath}${lt}/${ln}/${radius}/${limit}`
  //   return this._dataService.getData(url)
  // }
}
