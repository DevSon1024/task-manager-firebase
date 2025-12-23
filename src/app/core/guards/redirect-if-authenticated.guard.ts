import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const redirectIfAuthenticatedGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map((user) => {
      if (user) {
        // User is logged in, redirect to tasks
        router.navigate(['/tasks']);
        return false;
      } else {
        // User is not logged in, allow access to login/register
        return true;
      }
    })
  );
};