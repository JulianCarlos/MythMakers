import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private platformId = inject(PLATFORM_ID);

  private get ls(): Storage | null {
    return isPlatformBrowser(this.platformId) ? window.localStorage : null;
  }

  get(key: string): string | null {
    return this.ls?.getItem(key) ?? null;
  }

  set(key: string, value: string): void {
    this.ls?.setItem(key, value);
  }

  remove(key: string): void {
    this.ls?.removeItem(key);
  }
}
