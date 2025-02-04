import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements  OnInit{
  public loader$: Observable<boolean> = new Observable<boolean>();

  constructor(public _loaderService: LoaderService) {}

  public LoaderMessage: string = 'Searching';

  ngOnInit(): void {
    // this.LoaderMessage = this._loaderService.LoaderMessage || this.LoaderMessage  ;
    this.loader$ = this._loaderService.loaderUpdateEvent.asObservable();
  }
}
