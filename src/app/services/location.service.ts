import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor() {}

  private _mapLoaded: boolean = false;

  public get mapLoaded(): boolean {
    return this._mapLoaded;
  }
  public set mapLoaded(value: boolean) {
    this._mapLoaded = value;  
  }

  public LocatonChangedEvent: EventEmitter<ICurrentLocation> =
    new EventEmitter<ICurrentLocation>();

  private _currentLocation!: ICurrentLocation;

  public get currentLocation(): ICurrentLocation {
    return this._currentLocation;
  }

  public set currentLocation(currentLocaton: ICurrentLocation) {
    this._currentLocation = currentLocaton;
    this.resetLocation();
  }

  public resetLocation() {
    if (this._currentLocation) {
      this.LocatonChangedEvent.emit(this._currentLocation);
    }
  }

  public getLocation(): Observable<any> {
    // Create an Observable that will start listening to geolocation updates
    // when a consumer subscribes.
    return new Observable((observer) => {
      let watchId: number;

      // Simple geolocation API check provides values to publish
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position: GeolocationPosition) => {
            observer.next(position);
          },
          (error: GeolocationPositionError) => {
            observer.error(error);
          }
        );
      } else {
        observer.error('Geolocation not available');
      }

      // When the consumer unsubscribes, clean up data ready for next subscription.
      return {
        unsubscribe() {
          navigator.geolocation.clearWatch(watchId);
        },
      };
    });
  }
}

export interface ICurrentLocation {
  latitude: number;
  longitude: number;
  desc?: string;
  dragged?: boolean;
}
