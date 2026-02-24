import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // We check userProfile$ instead of just authState.
  // This ensures we also verify if they are an active (non-suspended) user.
  return authService.userProfile$.pipe(
    take(1),
    map((profile) => {
      if (profile) {
        if (profile.isActive === false) {
          router.navigate(['/']);
          return false;
        }
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    })
  );
};