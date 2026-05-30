import { Component, Input, Output, EventEmitter, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';
import { MasjidService } from '../../services/masjid.service';
import { catchError, finalize, map, Observable, of } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';

@Component({
    selector: 'app-pop-search',
    templateUrl: 'pop-search.component.html',
    styleUrls: ['pop-search.component.scss'],
    standalone: false,
})
export class PopSearchComponent implements OnChanges {
    @Input() showSearch: boolean = false;
    @Output() searchHidden = new EventEmitter<void>();
    @Output() resultSelected = new EventEmitter<any>();
    @ViewChild('searchbarRef') searchbar!: IonSearchbar;

    public searchQuery: string = '';
    public searchResults$: Observable<any> | undefined;
    public isSearching: boolean = false;

    constructor(private _masjidService: MasjidService, private _locationService: LocationService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['showSearch'] && changes['showSearch'].currentValue === true) {
            setTimeout(() => {
                this.searchbar?.setFocus();
            }, 100);
        }
    }

    public hideSearch() {
        this.showSearch = false;
        this.searchQuery = '';
        this.searchHidden.emit();
    }

    public search() {
        if (this.searchQuery.length > 2) {
            this.isSearching = true;
            this.searchResults$ = this._masjidService.searchMasjids(this.searchQuery.trim()).pipe(
                map((res) => res.data.masjids),
                catchError((err) => of({ error: 'Failed to load data' })),
                finalize(() => {
                    this.isSearching = false;
                    setTimeout(() => {
                        this.searchbar?.setFocus();
                    }, 50);
                })
            );
        } else {
            this.searchResults$ = undefined;
            this.isSearching = false;
        }
    }

    public goToSearchResult(result: any) {
        this.hideSearch();
        const northOffset = 100 / 111320;
        const correctedLat = result.masjidLocation.coordinates[1] + northOffset;
        const location = {
            latitude: correctedLat,
            longitude: result.masjidLocation.coordinates[0],
            dragged: false,
        };
        this.resultSelected.emit(location);
    }
}
