import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DescPopupComponent } from './desc-popup.component';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/core/services/storage.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SalaahTimesService } from 'src/app/services/salaah-times.service';

describe('DescPopupComponent', () => {
  let component: DescPopupComponent;
  let fixture: ComponentFixture<DescPopupComponent>;
  const SalahtimesStub = { salaahTimes: () => ({ return: '' }) };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DescPopupComponent],
      imports: [IonicModule.forRoot()],
      providers: [StorageService, Storage, provideHttpClient(), provideHttpClientTesting(), { useValue: SalahtimesStub, provide: SalaahTimesService }]
    }).compileComponents();

    fixture = TestBed.createComponent(DescPopupComponent);
    component = fixture.componentInstance;
    component.masjid = { _masjidId: '', masjidName: '', masjidAddress: { description: '', city: '', country: '', googlePlaceId: '', locality: '', phone: '', state: '', street: '', zipcode: '' }, masjidLocation: { type: '', coordinates: [0, 0] }, Distance: '', masjidCreatedby: '', masjidCreatedon: new Date(), masjidModifiedby: '', masjidModifiedon: new Date(), masjidPic: [], verified: false, masjidTimings: { fajr: '', zuhr: '', asr: '', maghrib: '', isha: '', jumah: '' }, masjidId: '', notMasjid: false };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
