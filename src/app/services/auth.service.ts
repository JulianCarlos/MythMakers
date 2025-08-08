import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {}

  login(username: string, password: string) {
    if (username && password) {
      return of({ token: 'fake-jwt-token' }).pipe(
        delay(500),
        tap(response => {
          localStorage.setItem('token', response.token);
          this.isLoggedInSubject.next(true);
        })
      );
    } else {
      return of({ error: 'Invalid credentials' }).pipe(delay(500));
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}
