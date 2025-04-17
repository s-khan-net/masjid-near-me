import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should retrieve a value by key', async () => {
    const mockKey = 'testKey';
    const mockValue = 'testValue';
    const storageSpy = jasmine.createSpyObj('Storage', ['get']);
    storageSpy.get.and.returnValue(Promise.resolve(mockValue));
    service['_storage'] = storageSpy;

    const result = await service.get(mockKey);

    expect(storageSpy.get).toHaveBeenCalledWith(mockKey);
    expect(result).toBe(mockValue);
  });

  it('should return undefined if storage is not initialized', async () => {
    service['_storage'] = null;

    const result = await service.get('testKey');

    expect(result).toBeUndefined();
  });
});
