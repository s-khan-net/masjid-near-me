import { TestBed } from '@angular/core/testing';

import { SalaahTimesService } from './salaah-times.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SalaahTimesService', () => {
  let service: SalaahTimesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), // Provide the HttpClient along with HttpClientTesting
        provideHttpClientTesting()
      ],
    });
    service = TestBed.inject(SalaahTimesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
