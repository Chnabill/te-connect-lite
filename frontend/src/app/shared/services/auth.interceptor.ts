import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  // Exclude registration and login endpoints from having the Authorization header
  const isRegister = req.url.includes('/api/users/register');
  const isLogin = req.url.includes('/auth/login');

  if (!isRegister && !isLogin) {
    // Check for both 'access_token' and 'token' for compatibility
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(cloned);
    }
  }
  return next(req);
}; 
