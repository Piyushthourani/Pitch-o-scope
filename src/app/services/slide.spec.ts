import { TestBed } from '@angular/core/testing';

import { Slide } from './slide';

describe('Slide', () => {
  let service: Slide;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Slide);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
