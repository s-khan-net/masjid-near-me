import { TestBed } from '@angular/core/testing';

import { SalaahTimesService } from './salaah-times.service';

describe('SalaahTimesService', () => {
  let service: SalaahTimesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalaahTimesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
