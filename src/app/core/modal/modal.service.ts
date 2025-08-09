import { Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Observable } from 'rxjs';
import { first, map, take } from 'rxjs/operators';
import { TextPromptDialogComponent, TextPromptData } from './text-prompt.dialog';
import { ConfirmDialogComponent, ConfirmData } from './confirm.dialog';

@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor(private dialog: Dialog) {}

  openTextPrompt(data: TextPromptData): Observable<string | undefined> {
    const ref = this.dialog.open<string | undefined>(TextPromptDialogComponent, {
      data,
      hasBackdrop: true,
      backdropClass: 'fancy-backdrop',
      disableClose: true,
      autoFocus: true
    });
    return ref.closed.pipe(take(1));
  }

  openConfirm(data: ConfirmData): Observable<boolean> {
    const ref = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data,
      hasBackdrop: true,
      backdropClass: 'fancy-backdrop',
      disableClose: true,
      autoFocus: true
    });

    return ref.closed.pipe(
      map(v => v === true),
      first()
    );
  }
}
