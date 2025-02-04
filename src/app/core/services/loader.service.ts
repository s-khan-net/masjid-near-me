import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  public loaderUpdateEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  public messageUpdateEvent: EventEmitter<Imessage> =
    new EventEmitter<Imessage>();

  constructor() {}
  private _loaderMessage: string = '';
  private _showSpinner: boolean = true;

  public get LoaderMessage() {
    return this._loaderMessage;
  }
  public set LoaderMessage(value: string) {
    this._loaderMessage = value;
    this.messageUpdateEvent.emit({ message: value });
  }
  public get ShowSpinner() {
    return this._showSpinner;
  }

  public set ShowSpinner(value: boolean) {
    this._showSpinner = value;
  }

  public showLoader() {
    this.loaderUpdateEvent.emit(true);
  }

  public hideLoader() {
    this.loaderUpdateEvent.emit(false);
  }

  public showMessage(msg: Imessage) {
    this.messageUpdateEvent.emit(msg);
  }
}

export interface Imessage {
  message: string;
  hide?: boolean;
}
