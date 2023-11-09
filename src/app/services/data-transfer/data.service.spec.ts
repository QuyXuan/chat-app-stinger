import { TestBed } from '@angular/core/testing';

import { DataTransferService } from './data.service';

describe('DataTransferService', () => {
  let service: DataTransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataTransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
