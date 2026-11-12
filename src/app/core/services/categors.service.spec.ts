import { TestBed } from '@angular/core/testing';

import { CategorsService } from './categors.service';

describe('CategorsService', () => {
  let service: CategorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
