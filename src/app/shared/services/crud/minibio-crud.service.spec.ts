import { TestBed } from '@angular/core/testing';

import { MinibioCrudService } from './minibio-crud.service';

describe('MinibioCrudService', () => {
  let service: MinibioCrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MinibioCrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
