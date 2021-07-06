import { TestBed } from '@angular/core/testing';

import { LinksCrudService } from './links-crud.service';

describe('LinksCrudService', () => {
  let service: LinksCrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinksCrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
