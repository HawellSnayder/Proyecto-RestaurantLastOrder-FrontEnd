import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectamos el ID de la plataforma
  const platformId = inject(PLATFORM_ID);

  // Si NO estamos en el navegador (estamos en el servidor),
  // dejamos pasar la petición sin tocar localStorage
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  // Ahora sí es seguro usar localStorage porque sabemos que estamos en el navegador
  const token = localStorage.getItem('token');

  // EXCEPCIÓN: Si la petición es para login o auth, NO enviamos el token.
  if (req.url.includes('/api/auth/')) {
    console.log('--- Interceptor (Ignorado para Auth) ---');
    return next(req);
  }

  console.log('--- Interceptor ---');
  console.log('URL de la petición:', req.url);

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
