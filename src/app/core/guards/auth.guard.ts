import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true; // Hay token, puede pasar
  } else {
    router.navigate(['/login']); // No hay token, fuera de aquí
    return false;
  }
};
