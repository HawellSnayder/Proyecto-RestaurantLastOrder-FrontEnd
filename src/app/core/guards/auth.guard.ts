// src/app/core/guards/auth.guard.ts
import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Si estamos en el servidor, permitimos la carga inicial
  // (la verdadera validación ocurrirá en el navegador)
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');

  if (token) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
