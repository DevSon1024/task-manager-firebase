import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, tap } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.userProfile$.pipe(
    take(1),
    map(user => {
      if (user && user.role === 'admin') {
        return true;
      }
      // If not admin, redirect to tasks
      return false;
    }),
     tap(isAdmin => {
      if (!isAdmin) {
        router.navigate(['/tasks']);
      }
    })
  );
};
