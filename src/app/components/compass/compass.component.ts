import { Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocationService, ICurrentLocation } from 'src/app/services/location.service';
import { PopupService } from 'src/app/services/popup.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
    selector: 'app-compass',
    templateUrl: './compass.component.html',
    styleUrls: ['./compass.component.scss'],
})
export class CompassComponent implements OnInit, OnDestroy {
    public currentLocation?: ICurrentLocation;
    public heading = 0;
    public dialRotation = 0;
    public cardinalDirection = 'N';
    public locationReady = false;
    public deviceSupported = true;
    public statusMessage = 'Waiting for location and orientation...';

    public degreesToQibla = 0;

    public opacity = 0.7;

    private _locationSubscription?: Subscription;

    constructor(private _locationService: LocationService, private _ngZone: NgZone, private _popupService: PopupService, private _settingsService: SettingsService) { }

    public osVersion: number = this._settingsService.osVersion;

    async ngOnInit(): Promise<void> {
        this._setCurrentLocation(this._locationService.currentLocation);
        if(!this._locationService.currentLocation.city) {
           this._locationService.getCity().subscribe();
        }
        if (typeof window !== 'undefined' && !('DeviceOrientationEvent' in window)) {
            this.deviceSupported = false;
            this.statusMessage = 'Device orientation not supported';
        }
    }

    ngOnDestroy(): void {
        this._locationSubscription?.unsubscribe();
    }

    @HostListener('window:deviceorientationabsolute', ['$event'])
    public onDeviceOrientation(event: DeviceOrientationEvent): void {
        if (!event) {
            return;
        }
        // this._ngZone.run(() => {
        //     this.handler(event);
        // });

        this._ngZone.run(() => {
            this._getHeading(event);
            this.cardinalDirection = this._directionFromHeading();
            this.dialRotation = -this.heading;

            this._setQiblahArrow();
            this.statusMessage = '';
        });
    }


    private _setQiblahArrow() {
        // ±9 degree
        if (
            this.degreesToQibla !== Math.round(Math.abs(this.heading))
        ) {
            this.opacity = 0.4;
        } else if (this.degreesToQibla) {
            this.opacity = 1;
        }
    }

    private _setCurrentLocation(location?: ICurrentLocation): void {
        this.currentLocation = location;
        this.locationReady = !!location && location.latitude != null && location.longitude != null;

        if (this.locationReady) {
            this.statusMessage = 'Compass ready';
            const { latitude, longitude } = location as ICurrentLocation;
            this.degreesToQibla = this.calcDegreeToPoint(latitude, longitude);

            if (this.degreesToQibla < 0) {
                this.degreesToQibla = this.degreesToQibla + 360;
            }
        } else {
            this.statusMessage = 'Location unavailable. Please enable location services.';
        }
    }

    private calcDegreeToPoint(latitude: number, longitude: number) {
        // Qibla geolocation
        const point = {
            lat: 21.422487,
            lng: 39.826206
        };

        const phiK = (point.lat * Math.PI) / 180.0;
        const lambdaK = (point.lng * Math.PI) / 180.0;
        const phi = (latitude * Math.PI) / 180.0;
        const lambda = (longitude * Math.PI) / 180.0;
        const psi =
            (180.0 / Math.PI) *
            Math.atan2(
                Math.sin(lambdaK - lambda),
                Math.cos(phi) * Math.tan(phiK) -
                Math.sin(phi) * Math.cos(lambdaK - lambda)
            );
        return Math.round(psi);
    }

    private _getHeading(event: DeviceOrientationEvent) {
        let heading = 0;

        if (typeof (event as any).webkitCompassHeading === 'number') {
            heading = (event as any).webkitCompassHeading;
        } else if (typeof event.alpha === 'number') {
            heading = Math.abs(event.alpha - 360);
        }

        this.heading = heading;
    }

    private _directionFromHeading(): string {
        if (this.heading >= 337.5 || this.heading < 22.5) return 'N';
        if (this.heading >= 22.5 && this.heading < 67.5) return 'NE';
        if (this.heading >= 67.5 && this.heading < 112.5) return 'E';
        if (this.heading >= 112.5 && this.heading < 157.5) return 'SE';
        if (this.heading >= 157.5 && this.heading < 202.5) return 'S';
        if (this.heading >= 202.5 && this.heading < 247.5) return 'SW';
        if (this.heading >= 247.5 && this.heading < 292.5) return 'W';
        return 'NW';
    }

    public hide() {
        this._popupService.closePopups();
    }
}
