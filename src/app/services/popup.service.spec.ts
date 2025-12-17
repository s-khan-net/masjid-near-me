import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';
import { PopupService } from './popup.service';
import { StorageService } from '../core/services/storage.service';
import { ModalController } from '@ionic/angular';

xdescribe('PopupService', () => {
  let service: PopupService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService, Storage, ModalController]
    });
    service = TestBed.inject(PopupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
