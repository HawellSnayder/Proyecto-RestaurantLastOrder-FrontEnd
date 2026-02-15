import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Intentamos obtener el token del localStorage
  const token = localStorage.getItem('token');

  // DEBUG: Esto te dirá en la consola si el interceptor está vivo
  console.log('--- Interceptor ---');
  console.log('URL de la petición:', req.url);
  console.log('Token encontrado:', token ? 'SÍ' : 'NO');

  // 2. Si hay token, clonamos la petición y añadimos el Header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // 3. Si no hay token, la petición sigue su curso original
  return next(req);
};
