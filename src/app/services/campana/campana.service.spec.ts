import { TestBed } from '@angular/core/testing';

import { CampanaService } from './campana.service';

describe('CampanaService', () => {
  let service: CampanaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CampanaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
