import { TestBed, async, inject } from '@angular/core/testing';

import { LoggedInAsAdminGuard } from './logged-in-as-admin.guard';

describe('LoggedInAsAdminGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggedInAsAdminGuard]
    });
  });

  it('should ...', inject([LoggedInAsAdminGuard], (guard: LoggedInAsAdminGuard) => {
    expect(guard).toBeTruthy();
  }));
});
