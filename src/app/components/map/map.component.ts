import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IMasjid } from '../../models/masjids.model';
import { MasjidService } from '../../services/masjid.service';
import { GoogleMap, MapType, Marker } from '@capacitor/google-maps';
import * as _ from 'lodash';
import {
  ICurrentLocation,
  LocationService,
} from 'src/app/services/location.service';
import { ModalController } from '@ionic/angular';
import { PopupService } from 'src/app/services/popup.service';
// import {
//   CameraConfig,
//   MapClickCallbackData,
// } from '@capacitor/google-maps/dist/typings/definitions';
import { LoaderService } from 'src/app/core/services/loader.service';

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
    private _modalCtrl: ModalController,
    private _popupService: PopupService,
    private _loaderService: LoaderService
  ) {}

  @Input() public masjids: IMasjid[] = [];
  @Input() public currentLocaton!: ICurrentLocation;
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;

  public masjidMarkers: any;
  private _map!: GoogleMap;
  private _markers: Marker[] = [];
  private _markerIds: string[] = [];

  ngOnInit() {
    this._locationService.LocatonChangedEvent.subscribe((res) => {
      if (res) {
        this._loaderService.LoaderMessage = 'Searching';
        this._loaderService.ShowSpinner = true;
        this._loaderService.showLoader();
        this.currentLocaton = res;
        if (!this._map) {
          this._setLocationOnMap();
        }
        this.getMasjids();
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
            title: this.getInfo(masjid),
            iconSize: {
              width: 25,
              height: 41,
            },
            tintColor: { r: 10, g: 46, b: 24, a: 0 },
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
      tintColor: { r: 69, g: 139, b: 214, a: 0 },
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
      };
      await this._map.removeMarkers(this._markerIds);
      this._markerIds = [];
      this.masjids = [];
    });

    this._map.setOnInfoWindowClickListener((event) => {
      this.markerClick(event);
    });
  }

  public async markerClick(event: any) {
    const masjid = this.masjidMarkers.filter((m: any) => {
      return m.markerId == event.markerId;
    })[0];
    // const  coordinate = {
    //   lat: this.currentLocaton.latitude,
    //   lng: this.currentLocaton.longitude,
    // }
    // const m: Marker = this._markers.filter(marker => {
    //   return marker.coordinate == coordinate
    // })[0]
    // const click_event: MapClickCallbackData = {
    //   mapId: 'mnm-map',
    //   latitude: masjid.masjidLocation.coordinates[1],
    //   longitude: masjid.masjidLocation.coordinates[0],
    // }
    // await this._map.setOnMapClickListener((event) => {
    this.moveToMarker(event);
    setTimeout(() => {
      this._popupService.showMasjidDesc(masjid);
    }, 300);

    // })
  }

  public moveToMarker(event: any) {
    const markerLocation = {
      lat: event.latitude,
      lng: event.longitude,
    };
    const cameraConfig = {
      animate: true,
      coordinate: markerLocation,
      zoom: 15,
    };
    this._map.setCamera(cameraConfig);
  }

  private getMasjids(): void {
    const sessionSettings = sessionStorage.getItem('userSettings');
    let radius = 2000;
    if (sessionSettings) {
      radius = JSON.parse(atob(sessionSettings)).radius;
    }
    this._masjidService
      .getMasjids(
        this.currentLocaton.latitude,
        this.currentLocaton.longitude,
        radius,
        12
      )
      .subscribe(
        async (masjids: IMasjid[]) => {
          this.moveToMarker({
            latitude: this.currentLocaton.latitude,
            longitude: this.currentLocaton.longitude,
          });
          if (masjids && masjids.length > 0) {
            this.masjids = masjids;
            await this._setMarkersForMasjids();
          } else {
            this.masjids = [];
            this._loaderService.hideLoader();
            this._loaderService.LoaderMessage = 'No Masjids Found';
            this._loaderService.showLoader();
            setTimeout(() => {
              this._loaderService.hideLoader();
            }, 1500);
            // this._loaderService.messageUpdateEvent.emit({message:'No Masjids Found',hide:true})
          }
          this._loaderService.hideLoader();
        },
        (err: any) => {
          console.error('err', err);
          this._loaderService.hideLoader();
        }
      );
  }

  private getInfo(masjid: IMasjid) {
    var contentStr =
      masjid.masjidName + '\n' + parseFloat(masjid.Distance).toFixed(2) ||
      '' + ' Km from you. \n';
    if (masjid.masjidId == 'xoxoxo') {
      // if(masjid.Distance<=0.4 && $('#hidUser').val().length>1)
      // {
      //     contentStr = contentStr + 'You are near this masjid, please verify. ';
      // }
      contentStr = contentStr + 'This masjid is not verified';
    } else {
      // if(masjid.Distance<=0.4 && $('#hidUser').val().length>1)
      // {
      //     contentStr = contentStr + 'You are near this masjid, please update the salaah times. ';
      // }
      if (
        !masjid.masjidTimings.fajr &&
        !masjid.masjidTimings.zuhr &&
        !masjid.masjidTimings.asr &&
        !masjid.masjidTimings.maghrib &&
        !masjid.masjidTimings.isha &&
        !masjid.masjidTimings.jumah
      ) {
        contentStr = contentStr + 'Salaah timings are not available.';
      } else {
        let m = '-';
        contentStr =
          contentStr +
          'FAJR: ' +
          masjid.masjidTimings.fajr +
          ', DHUHR: ' +
          masjid.masjidTimings.zuhr +
          '\n';
        contentStr =
          contentStr +
          'ASR: ' +
          masjid.masjidTimings.asr +
          ', MAGHRIB: ' +
          m +
          '\n';
        contentStr =
          contentStr +
          'ISHA: ' +
          masjid.masjidTimings.isha +
          ', JUMAH: ' +
          masjid.masjidTimings.jumah +
          '\n';
      }
    }

    return contentStr;
  }
}
