import { Injectable, signal, computed, effect } from '@angular/core';
import { StorageService } from './storage.service';

type MockToken = { sub: string; roles: string[]; exp: number }; // exp in epoch seconds

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'auth_token';
  private _token = signal<MockToken | null>(null);

  readonly isLoggedIn = computed(() => !!this._token());
  readonly roles = computed(() => this._token()?.roles ?? []);

  private logoutTimer: any;

  constructor(private storage: StorageService) {
    const raw = this.storage.get(this.storageKey);
    if (raw) {
      try {
        const t: MockToken = JSON.parse(raw);
        if (t.exp * 1000 > Date.now()) {
          this._token.set(t);
          this.scheduleAutoLogout(t.exp);
        } else {
          this.storage.remove(this.storageKey);
        }
      } catch {
        this.storage.remove(this.storageKey);
      }
    }

    effect(() => {
      const t = this._token();
      if (t) this.storage.set(this.storageKey, JSON.stringify(t));
      else this.storage.remove(this.storageKey);
    });
  }

  login(username: string, password: string): boolean {
    const ok = username === 'Test' && password === '123123123';
    if (!ok) return false;

    const exp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
    const token: MockToken = { sub: username, roles: ['user'], exp };
    this._token.set(token);
    this.scheduleAutoLogout(exp);
    return true;
  }

  logout(): void {
    this._token.set(null);
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  private scheduleAutoLogout(exp: number) {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    const ms = exp * 1000 - Date.now();
    if (ms > 0) this.logoutTimer = setTimeout(() => this.logout(), ms);
  }
}
