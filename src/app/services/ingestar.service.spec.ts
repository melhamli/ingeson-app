import { TestBed } from '@angular/core/testing';

import { IngestarService } from './ingestar.service';

describe('IngestarService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IngestarService = TestBed.get(IngestarService);
    expect(service).toBeTruthy();
  });
});
