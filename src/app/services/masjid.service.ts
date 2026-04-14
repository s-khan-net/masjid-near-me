import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DataService } from '../core/services/dataservice.service';
import { IMasjid } from '../models/masjids.model';
import { MnmConstants } from '../core/mnm-constants';
import { Subject } from 'rxjs';
import { StorageService } from '../core/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class MasjidService {

  private _storage: StorageService = inject(StorageService);

  private masjidsLoaded = new Subject<{ masjids: IMasjid[], dragged: boolean }>();
  masjidsLoaded$ = this.masjidsLoaded.asObservable();

  public getMasjids(lt: number, ln: number, radius: number, limit: number, dragged?: boolean): Observable<IMasjid[]> {
    if (!radius) radius = 2000;
    if (!limit) limit = 20;
    let url = `${MnmConstants.baseUrl}${MnmConstants.masjidMidPath}${lt}/${ln}/${radius}/${limit}`;
    return this._dataService.getData(url).pipe(
      tap((masjids: IMasjid[]) => this.masjidsLoaded.next({ masjids: masjids, dragged: !!dragged }))
    );
  }

  getMasjidDetails(googlePlaceId: string): Observable<any> {
    const url = `${MnmConstants.baseUrl}${MnmConstants.masjidMidPath}details/${googlePlaceId}`;
    return this._dataService.getData(url)
  }
  updateMasjid(masjid: IMasjid): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const url = `${MnmConstants.baseUrl}${MnmConstants.masjidMidPath}`;
      this._dataService.putService(url, { masjid }).subscribe(async (data) => {
        if (JSON.stringify(data)) {
          if (JSON.parse(JSON.stringify(data)).body.updated) {
            console.log('Masjid updated successfully');
            //update the masjids list after update
            await this._updateMyMasjids(masjid);
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


  private async _updateMyMasjids(masjid: IMasjid) {
    const myMasjids = await this._storage.get('myMasjids');
    const myMasjidsList = myMasjids ? JSON.parse(atob(myMasjids)) : [];
    const inmyMasjids = myMasjidsList.find((m: any) => m.masjidAddress.googlePlaceId === masjid.masjidAddress.googlePlaceId);
    if (masjid.notMasjid && inmyMasjids) {
      myMasjidsList.splice(myMasjidsList.indexOf(inmyMasjids), 1);
    }
    else if (inmyMasjids) {
      inmyMasjids.masjidTimings = masjid.masjidTimings;
      inmyMasjids.masjidName = masjid.masjidName;
      inmyMasjids.masjidAddress = masjid.masjidAddress;
    }
    await this._storage.set('myMasjids', btoa(JSON.stringify(myMasjidsList)));
  }
  // public getMasjids(lt: number, ln: number, radius: number, limit: number): Observable<IMasjid[]> {
  //   if (!radius)
  //     radius = 2000;
  //   if (!limit)
  //     limit = 20;
  //   let url= `${MnmConstants.baseUrl}${MnmConstants.masjidMidPath}${lt}/${ln}/${radius}/${limit}`
  //   return this._dataService.getData(url)
  // }
}
