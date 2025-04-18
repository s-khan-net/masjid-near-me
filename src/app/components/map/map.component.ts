import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IMasjid } from '../../models/masjids.model';
import { MasjidService } from '../../services/masjid.service';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import * as _ from 'lodash';
import {
  ICurrentLocation,
  LocationService,
} from 'src/app/services/location.service';
import { PopupService } from 'src/app/services/popup.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { UsersService } from 'src/app/services/users.service';

const apiKey = 'AIzaSyAB6Njiq1JlO93CzrFg901RY9fsRYW3mcE';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  constructor(
    private _masjidService: MasjidService,
    private _locationService: LocationService,
    private _popupService: PopupService,
    private _loaderService: LoaderService,
    private _storage: StorageService,
    private _userService: UsersService
  ) {}

  @Input() public masjids: IMasjid[] = [];
  @Input() public currentLocaton!: ICurrentLocation;
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;

  public masjidMarkers: any;
  public _map!: GoogleMap;
  private _markers: Marker[] = [];
  private _markerIds: string[] = [];

  ngOnInit() {
    this._locationService.LocatonChangedEvent.subscribe((res) => {
      if (res) {
        this._locationService.mapLoaded = true;
        if (!this._map) {
          this._loaderService.LoaderMessage = 'Loading Map';
          this._loaderService.ShowSpinner = true;
          this._loaderService.showLoader();
          this.currentLocaton = res;
          this._setLocationOnMap();
        } else {
          this.getMasjids(res.dragged);
        }
      }
    });
  }

  private async _setMarkersForMasjids() {
    if (this.masjids) {
      this._markers = [];
      setTimeout(() => {
        this.masjids.forEach((masjid) => {
          this._markers.push({
            coordinate: {
              lat: masjid.masjidLocation.coordinates[1],
              lng: masjid.masjidLocation.coordinates[0],
            },
            title: masjid.masjidName,
            snippet: this.getInfo(masjid),
            iconSize: {
              width: 35,
              height: 32,
            },
            // tintColor: { r: 10, g: 46, b: 24, a: 0 },
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          });
        });
        this._map.addMarkers(this._markers).then((ids) => {
          this.masjidMarkers = _.cloneDeep(this.masjids);
          this.masjidMarkers.map((masjid: any, index: any) => {
            this._markerIds = ids;
            masjid['markerId'] = ids[index];
          });
        });
      }, 100);
    }
  }
  private async _setLocationOnMap() {
    this._map = await GoogleMap.create({
      id: 'mnm-map', // Unique identifier for this map instance
      element: this.mapRef.nativeElement, // reference to the capacitor-google-map element
      apiKey: apiKey, // Your Google Maps API Key
      config: {
        center: {
          // The initial position to be rendered by the map
          lat: this.currentLocaton.latitude,
          lng: this.currentLocaton.longitude,
        },
        disableDefaultUI: true,
        // mapTypeId: MapType.Normal,
        maxZoom: 19,
        zoom: 15, // The initial zoom level to be rendered by the map
      },
    });
    await this._map.addMarker({
      coordinate: {
        lat: this.currentLocaton.latitude,
        lng: this.currentLocaton.longitude,
      },
      draggable: true,
      // iconUrl: 'assets/icon/marker-icon-2x.png',
      // title: 'You are here',
      iconSize: {
        width: 25,
        height: 41,
      },
      // tintColor: { r: 69, g: 139, b: 214, a: 0 },
      iconUrl: 'assets/icon/pin.png',
    });
    await this._map.setOnMarkerClickListener(async (event) => {
      const masjid = this.masjidMarkers.filter((m: any) => {
        return m.markerId == event.markerId;
      })[0];
      this.moveToMarker(event);
      if (masjid) this._popupService.showMasjidDesc(masjid);
    });
    await this._map.setOnMarkerDragEndListener(async (event) => {
      this._locationService.currentLocation = {
        latitude: event.latitude,
        longitude: event.longitude,
        desc: event.title,
        dragged: true,
      };
      await this._map.removeMarkers(this._markerIds);
      this._markerIds = [];
      this.masjids = [];
    });

    this._map.setOnInfoWindowClickListener((event) => {
      this.markerClick(event);
    });

    this.getMasjids();
  }

  public async markerClick(event: any) {
    const masjid = this.masjidMarkers.filter((m: any) => {
      return m.markerId == event.markerId;
    })[0];
    this.moveToMarker(event, 17);
    setTimeout(() => {
      this._popupService.showMasjidDesc(masjid);
    }, 300);
  }

  public moveToMarker(event: any, zoom = 17) {
    const markerLocation = {
      lat: event.latitude,
      lng: event.longitude,
    };
    const cameraConfig = {
      animate: true,
      coordinate: markerLocation,
      zoom: zoom,
    };
    this._map.setCamera(cameraConfig);
  }

  private async getMasjids(dragged?: boolean): Promise<void> {
    this._loaderService.hideLoader();
    this._loaderService.LoaderMessage = 'Searching';
    this._loaderService.ShowSpinner = true;
    this._loaderService.showLoader();
    this.currentLocaton = this._locationService.currentLocation;
    const sessionSettings = await this._storage.get('userSettings');
    let radius = 2000;
    if (sessionSettings) {
      radius = JSON.parse(atob(sessionSettings)).radius;
    }
    let self = this;
    this._masjidService
      .getMasjids(
        this.currentLocaton.latitude,
        this.currentLocaton.longitude,
        radius,
        12,
        dragged
      )
      .subscribe(
        async (masjids: IMasjid[]) => {
          self.moveToMarker({
            latitude: self.currentLocaton.latitude,
            longitude: self.currentLocaton.longitude,
          });
          if (masjids && masjids.length > 0) {
            self.masjids = masjids;
            await self._setMarkersForMasjids();
            self._loaderService.hideLoader();
            self._checkUserTokenValidity();
          } else {
            self.masjids = [];
            self._loaderService.hideLoader();
            self._loaderService.LoaderMessage = 'No Masjids Found';
            this._loaderService.ShowSpinner = false;
            self._loaderService.showLoader();
            setTimeout(() => {
              self._loaderService.hideLoader();
              self._checkUserTokenValidity();
            }, 2500);
            // this._loaderService.messageUpdateEvent.emit({message:'No Masjids Found',hide:true})
          }
        },
        (err: any) => {
          console.error('err', err);
          this._loaderService.hideLoader();
        }
      );
  }
  private async _checkUserTokenValidity() {
    const token = await this._storage.get('token');
    if (!token) {
      return;
    }
    (await this._userService.getUserByToken()).subscribe({
      next: (data: any) => {
        if (!data || !data.body.user) {
          console.log('No user found');
          this._accessdeniedError();
        } else {
          sessionStorage.removeItem('token');
          sessionStorage.setItem('token', token);
        }
      },
      error: (err: any) => {
        console.log('No user found');
        this._accessdeniedError();
      },
    });
  }
  private async _accessdeniedError(): Promise<void> {
    const profile = await this._storage.get('userProfile');
    this._loaderService.hideLoader();
    //clear user data
    this._storage.clear();
    sessionStorage.clear();

    if (profile) {
      const name = JSON.parse(atob(profile))?.firstName;
      this._loaderService.LoaderMessage = `Hi ${name}, it has been a while since you have logged in. Please log in again.`;
    } else {
      this._loaderService.LoaderMessage =
        'it has been a while since you have logged in. Please log in again.';
    }
    this._loaderService.ShowSpinner = false;
    this._loaderService.showLoader();
    setTimeout(() => {
      this._loaderService.hideLoader();
    }, 5000);
  }

  private getInfo(masjid: IMasjid) {
    return masjid.Distance
      ? `Distance: ${parseFloat(masjid.Distance).toFixed(2)} Km`
      : '';
  }

  public async resetLocation() {
    await this._map.removeMarkers(this._markerIds);
    this._markerIds = [];
    this.masjids = [];
    this._locationService.LocatonChangedEvent.emit(this.currentLocaton);
  }
}
