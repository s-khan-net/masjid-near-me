import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MnmHelpComponent } from './mnm-help.component';
import { StorageService } from 'src/app/core/services/storage.service';
import { Storage } from '@ionic/storage-angular';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('MnmHelpComponent', () => {
  let component: MnmHelpComponent;
  let fixture: ComponentFixture<MnmHelpComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MnmHelpComponent],
      imports: [IonicModule.forRoot()],
      providers:[ StorageService, Storage, provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(MnmHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
