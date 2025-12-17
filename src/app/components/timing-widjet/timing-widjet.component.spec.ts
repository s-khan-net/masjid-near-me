import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TimingWidjetComponent } from './timing-widjet.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StorageService } from 'src/app/core/services/storage.service';
import { Storage } from '@ionic/storage-angular';

describe('TimingWidjetComponent', () => {
  let component: TimingWidjetComponent;
  let fixture: ComponentFixture<TimingWidjetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TimingWidjetComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        provideHttpClient(), // Provide the HttpClient along with HttpClientTesting
        provideHttpClientTesting(), StorageService, Storage,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimingWidjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
