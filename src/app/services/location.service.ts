import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { Geolocation, PermissionStatus, Position, PositionOptions } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor() { }

  private _mapLoaded: boolean = false;

  public get mapLoaded(): boolean {
    return this._mapLoaded;
  }
  public set mapLoaded(value: boolean) {
    this._mapLoaded = value;
  }

  public LocationChangedEvent: EventEmitter<ICurrentLocation> =
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
      this.LocationChangedEvent.emit(this._currentLocation);
    }
  }

  public getCity(): Observable<string> {
    return new Observable((observer) => {
      // Simple geolocation API check provides values to publish
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.currentLocation.latitude}&lon=${this.currentLocation.longitude}`)
        .then(response => response.json())
        .then(data => {
          const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || '';
          const country = data.address.country || '';
          this._currentLocation.city = `${city}, ${country}`;
          observer.next(city);
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
  public getLocation(): Observable<any> {
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

  public getNavigatorCurrentLocation(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Navigator geolocation is not available'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => resolve(position),
        (error: GeolocationPositionError) => reject(error),
        options
      );
    });
  }

  public async checkLocationPermission(): Promise<PermissionStatus> {
    return Geolocation.checkPermissions();
  }

  public getCurrentLocation(options?: PositionOptions): Promise<Position> {
    return Geolocation.getCurrentPosition(options);
  }

  public requestLocationPermission(): Promise<PermissionStatus> {
    return Geolocation.requestPermissions();
  }

}

export interface ICurrentLocation {
  latitude: number;
  longitude: number;
  heading?: any;
  city?: any;
  desc?: string;
  dragged?: boolean;
}
