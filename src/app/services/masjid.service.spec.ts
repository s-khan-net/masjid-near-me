import { TestBed } from '@angular/core/testing';

import { MasjidService } from './masjid.service';

describe('MasjidService', () => {
  let service: MasjidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasjidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
