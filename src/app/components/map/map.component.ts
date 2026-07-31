import { ChangeDetectorRef, Component, effect, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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

const apiKey = 'AIzaSyAB6Njiq1JlO93CzrFg901RY9fsRYW3mcE';
// Qibla geolocation
const qibla = {
  lat: 21.422487,
  lng: 39.826206
};
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  @Input() public masjids: IMasjid[] = [];
  @Input() public currentLocaton!: ICurrentLocation;
  @ViewChild('map') mapRef!: ElementRef;
  @ViewChild('mapModePin') mapModePin!: ElementRef;
  @ViewChild('pinContainer') pinContainer!: ElementRef;
  @ViewChild('mapCover') mapCover!: ElementRef;

  public masjidMarkers: any;
  public _map!: GoogleMap;
  private _markers: Marker[] = [];
  private _markerIds: string[] = [];
  public mapZoom: number = 3;
  public pinPlaced: boolean = false;
  private _placementPinId: string | null = null;

  constructor(
    private _masjidService: MasjidService,
    public _locationService: LocationService,
    private _popupService: PopupService,
    private _loaderService: LoaderService,
    private _storage: StorageService,
    private cd: ChangeDetectorRef,
  ) {
    effect(async () => {
      if (this._locationService.mapMode()) {
        // Handle map mode changes if needed
        if (this._map) {
          await this._map.removeMarkers(this._markerIds);
          this._map.setCamera(
            {
              coordinate: {
                lat: qibla.lat,
                lng: qibla.lng,
              }, zoom: 2, animate: true
            }
          );
        }
      }
      else {
        this.pinPlaced = false;
        if (this._placementPinId && this._map) {
          await this._map.removeMarkers([this._placementPinId]);
          this._placementPinId = null;
        }
        if (this._locationService.currentLocation)
          this._locationService.LocationChangedEvent.emit(this._locationService.currentLocation);
        // this._setLocationOnMap();
      }
    });
  }

  ngOnInit() {
    this._locationService.LocationChangedEvent.subscribe(async (res) => {
      if (res) {
        this._locationService.mapLoaded = true;
        this.currentLocaton = res;
        if (!this._map) {
          this._loaderService.LoaderMessage = 'Loading Map';
          this._loaderService.ShowSpinner = true;
          this._loaderService.showLoader();
          this._setLocationOnMap();
        } else {
          await this._map.removeMarkers(this._markerIds);
          this._setLocationOnMap();
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
          this._markerIds = [...this._markerIds, ...ids];
          this.masjidMarkers = _.cloneDeep(this.masjids);
          this.masjidMarkers.map((masjid: any, index: any) => {
            masjid['markerId'] = ids[index];
          });
        });
      }, 100);
    }
  }
  private async _setLocationOnMap() {
    if (this._map) {
      this._map.setCamera(
        {
          coordinate: {
            lat: this.currentLocaton.latitude,
            lng: this.currentLocaton.longitude,
          }, zoom: 15, animate: true
        }
      );
    }
    else {
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
          minZoom: 3,
          zoom: 15, // The initial zoom level to be rendered by the map
        },
      });
    }
    await this._map.addMarker({
      coordinate: {
        lat: this.currentLocaton.latitude,
        lng: this.currentLocaton.longitude,
      },
      draggable: true,
      iconSize: {
        width: 25,
        height: 41,
      },
      // tintColor: { r: 69, g: 139, b: 214, a: 0 },
      iconUrl: 'assets/icon/pin.png',
    }).then((markerId) => {
      this._markerIds.push(markerId);
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

    await this._map.setOnMapClickListener(() => {
      document.dispatchEvent(new MouseEvent('click', { bubbles: false, clientX: 10, clientY: 10 }));
    });

    await this._map.setOnInfoWindowClickListener((event) => {
      this.markerClick(event);
    });

    await this._map.setOnCameraIdleListener((data) => {
      this.mapZoom = data.zoom;
      this.cd.detectChanges();

      if (!this._locationService.mapMode()) {
        return;
      }
      else {
        if (this.mapZoom <= 6) {
          this._locationService.mapModeInfo.set(`Zoom ${data.zoom.toFixed(1)} into your preferred location`);
          return;
        }
        if (this.mapZoom > 6 && this.mapZoom < 9) {
          this._locationService.mapModeInfo.set(`Zoom ${data.zoom.toFixed(1)} into your city`);
          return;
        }
        if (this.mapZoom >= 9 && this.mapZoom < 13) {
          this._locationService.mapModeInfo.set(`Zoom ${data.zoom.toFixed(1)} in a little more`);
          return;
        }
        if (this.mapZoom > 13) {
          this._locationService.mapModeInfo.set('place the pin on the map to search for masjids');
          this._addeventListenersForPinDrag();
          return;
        }
      }
    });
    this.getMasjids(this.currentLocaton.dragged);
  }

  //#region MapMode Pin Drag and Drop 

  private _addeventListenersForPinDrag() {
    let pincontainerRect = this.pinContainer.nativeElement.getBoundingClientRect();
    let pin = this.mapModePin.nativeElement;
    let mapCover = this.mapCover.nativeElement;
    const xOffset = 32;
    const yOffset = 255;

    pin.addEventListener('touchstart', (e: any) => {
      let touchLocation = e.targetTouches[0];

      // assign box new coordinates based on the touch.
      pin.style.left = touchLocation.pageX - xOffset + 'px';
      pin.style.top = (touchLocation.pageY - yOffset) + 'px';
    })

    pin.addEventListener('touchmove', (e: any) => {
      mapCover.style.display = 'block';
      // grab the location of touch
      let touchLocation = e.targetTouches[0];

      // assign box new coordinates based on the touch.
      pin.style.left = (touchLocation.pageX - xOffset) + 'px';
      pin.style.top = (touchLocation.pageY - yOffset) + 'px';
      const x = parseInt(pin.style.left);
      const y = parseInt(pin.style.top);
      if (!this._isInZone(x + xOffset, y + yOffset, pincontainerRect)) {
        this.pinContainer.nativeElement.style.borderStyle = 'solid';
      }
      else {
        this.pinContainer.nativeElement.style.borderStyle = 'dashed';
      }
    })
    pin.addEventListener('touchend', (e: any) => {
      mapCover.style.display = 'none';
      // current box position.
      const x = parseInt(pin.style.left);
      const y = parseInt(pin.style.top);
      if (!this._checkDropZone(x + xOffset, y + yOffset)) {
        this._latLngFromScreenPoint(x, y).then(async (coords: any) => {
          if (!coords) {
            return;
          }
          if (this._isPinOnWater(coords.lat, coords.lng)) {
            this._popupService.showToast('Pin is on water. Please place it on land.', 'top', 2000, 'alert-circle');
            return;
          }
          await this._placePinAt(coords.lat, coords.lng);
        });
      }
      else {
        this.pinContainer.nativeElement.style.borderStyle = 'solid';
      }
    })
  }
  private _isPinOnWater(lat: any, lng: any): boolean {
    return false; // Placeholder for actual implementation to check if the pin is on water

    throw new Error('Method not implemented.');
  }

  private _checkDropZone(currentX: number, currentY: number) {
    const pincontainerRect = this.pinContainer.nativeElement.getBoundingClientRect();
    // console.log(`currentX: ${currentX}, currentY: ${currentY}, pincontainerRect: ${pincontainerRect.left} - ${pincontainerRect.right} - ${pincontainerRect.top} - ${pincontainerRect.bottom}`);
    if (this._isInZone(currentX, currentY, pincontainerRect)) {
      // this.pinContainer.nativeElement.style.backgroundColor = 'blue';
      return true;
    } else {
      // this.pinContainer.nativeElement.style.backgroundColor = 'lightgray';
      return false;
    }
  }

  private _isInZone(x: number, y: number, pincontainerRect: any): boolean {
    if (x < pincontainerRect.left || x >= pincontainerRect.right) {
      return false;
    }
    if (y < pincontainerRect.top || y >= pincontainerRect.bottom) {
      return false;
    }
    return true;
  }

  private async _latLngFromScreenPoint(clientX: number, clientY: number): Promise<{ lat: number; lng: number } | null> {
    if (!this._map || !this.mapRef || clientX === undefined || clientY === undefined) {
      return null;
    }

    const rect = this.mapRef.nativeElement.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      return null;
    }

    const xRatio = (clientX - rect.left) / rect.width;
    const yRatio = (clientY - rect.top) / rect.height;
    const bounds = await this._map.getMapBounds();

    const west = bounds.southwest.lng;
    const east = bounds.northeast.lng;
    const north = bounds.northeast.lat;
    const south = bounds.southwest.lat;

    const lng = west + xRatio * (east - west);
    const mercatorY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    const inverseMercator = (y: number) => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI;
    const northY = mercatorY(north);
    const southY = mercatorY(south);
    const lat = inverseMercator(northY + yRatio * (southY - northY));

    return { lat, lng };
  }

  private async _placePinAt(latitude: number, longitude: number): Promise<void> {
    if (!this._map) {
      return;
    }

    if (this._placementPinId) {
      await this._map.removeMarkers([this._placementPinId]);
      this._placementPinId = null;
    }

    this._placementPinId = await this._map.addMarker({
      coordinate: {
        lat: latitude,
        lng: longitude,
      },
      draggable: true,
      iconSize: {
        width: 25,
        height: 41,
      },
      iconUrl: 'assets/icon/pin.png',
    });

    this.pinPlaced = true;
    this._locationService.setMapMode(false);
    // this.cd.detectChanges();
    this._locationService.currentLocation = {
      latitude: latitude,
      longitude: longitude,
      desc: 'mapMode Location',
      dragged: true,
    }
    this._popupService.showToast('Pin placed on the map. Drag it to adjust the position.', 'top', 1300, 'map-marker');
  }

  //#endregion

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

  private async getMasjids(dragged?: boolean, radius: number = 2000): Promise<void> {
    this._locationService.setMapMode(false);
    this._loaderService.LoaderMessage = `Searching for masjids within ${radius / 1000} km`;
    this._loaderService.ShowSpinner = true;
    this._loaderService.showLoader();
    this.currentLocaton = this._locationService.currentLocation;
    const sessionSettings = await this._storage.get('userSettings');
    if (sessionSettings) {
      radius = JSON.parse(atob(sessionSettings)).radius > radius ? JSON.parse(atob(sessionSettings)).radius : radius;
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
          } else {
            if (radius < 25000) {
              self._reloadMasjidsForMoreRadius(radius);
            }
            else {
              self.masjids = [];
              self._loaderService.hideLoader();
              self._loaderService.LoaderMessage = 'No Masjids Found';
              self._loaderService.ShowSpinner = false;
              self._loaderService.showLoader();
              setTimeout(() => {
                self._loaderService.hideLoader();
              }, 2500);
              // this._loaderService.messageUpdateEvent.emit({message:'No Masjids Found',hide:true})
            }
          }
        },
        (err: any) => {
          console.error('err', err);
          this._loaderService.hideLoader();
        }
      );
  }
  private _reloadMasjidsForMoreRadius(radius: number) {
    this._loaderService.LoaderMessage = `No masjids found within ${radius / 1000} km. Expanding search radius to ${(radius / 1000) + 5} km`
    this.getMasjids(true, radius + 5000);
  }
  private async _accessdeniedError(): Promise<void> {
    const profile = await this._storage.get('userProfile');
    this._loaderService.hideLoader();
    //clear user data (logout user)
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
    }, 3500);
  }

  private getInfo(masjid: IMasjid) {
    return masjid.Distance
      ? `Distance: ${parseFloat(masjid.Distance).toFixed(2)} Km`
      : '';
  }
}
