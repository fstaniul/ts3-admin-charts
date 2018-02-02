import { TestBed, inject } from '@angular/core/testing';

import { AuthHttpInterceptor } from './auth.interceptor';

describe('AuthHttpInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthHttpInterceptor]
    });
  });

  it('should be created', inject([AuthHttpInterceptor], (service: AuthHttpInterceptor) => {
    expect(service).toBeTruthy();
  }));
});
