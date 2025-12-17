import { TestBed } from '@angular/core/testing';

import { MasjidService } from './masjid.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('MasjidService', () => {
  let service: MasjidService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(MasjidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
