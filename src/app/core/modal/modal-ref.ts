import { Subject, Observable } from 'rxjs';

export class ModalRef<T = any> {
  private readonly _afterClosed = new Subject<T | undefined>();

  get afterClosed$(): Observable<T | undefined> {
    return this._afterClosed.asObservable();
  }

  _close(value?: T) {
    this._afterClosed.next(value);
    this._afterClosed.complete();
  }
}