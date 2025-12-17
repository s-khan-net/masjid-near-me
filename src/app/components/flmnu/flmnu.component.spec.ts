import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FlmnuComponent } from './flmnu.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('FlmnuComponent', () => {
  let component: FlmnuComponent;
  let fixture: ComponentFixture<FlmnuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FlmnuComponent],
      imports: [IonicModule.forRoot(), BrowserAnimationsModule],
      providers: [
        provideHttpClient(), // Provide the HttpClient along with HttpClientTesting
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FlmnuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
