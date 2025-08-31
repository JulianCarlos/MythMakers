// selection-grid.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { Observable, take } from 'rxjs';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  SelectionDialogComponent,
  SelectionDialogData,
} from '../modal/selection-dialog.component';

type MaybeNum = number | string;

@Component({
  selector: 'app-selection-grid',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenu, MatMenuTrigger, MatMenuItem, MatIcon],
  templateUrl: './selection-grid.component.html',
  styleUrls: ['./selection-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // 👇 enables Reactive/Template-driven forms integration
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectionGridComponent),
      multi: true,
    },
  ],
})
export class SelectionGridComponent implements ControlValueAccessor {
  @Input({ required: true }) options$!: Observable<readonly any[]>;

  // Keep your existing API; under the hood we sync to an internal value.
  private _value: readonly any[] = [];
  @Input() get value() { return this._value; }
  set value(v: readonly any[]) { this.setInternalValue(v, { fromWrite: false }); }
  @Output() valueChange = new EventEmitter<readonly any[]>();

  @Input() displayWith: (item: any) => string = i => i?.name ?? i?.title ?? String(i ?? '');
  @Input() title = 'Items';
  @Input() canAdd = true;
  @Input() canRemove = true;
  @Input() removeAriaLabel = 'Remove';
  @Input() addAriaLabel = 'Add';
  @Input() itemButtonClass = 'btn btn--icon btn--primary';
  @Input() addButtonClass = 'btn btn--icon btn--outline';
  @Input() tileBackground?: string;

  /** Optional equality fn; default is reference equality (no behavior change). */
  @Input() compareWith: (a: any, b: any) => boolean = Object.is;

  /** FormControl disabled state (also usable as an @Input) */
  @Input() disabled = false;

  @HostBinding('style.--grid-gap') private _gridGap?: string;
  @HostBinding('style.--grid-mb') private _gridMb?: string;
  @HostBinding('style.--tile-size') private _tileSize?: string;
  @HostBinding('style.--tile-radius') private _tileRadius?: string;
  @HostBinding('style.--remove-size') private _removeSize?: string;
  @HostBinding('style.--remove-offset') private _removeOffset?: string;

  @Input() set gap(v: MaybeNum) { this._gridGap = this.asCss(v, 'px'); }
  @Input() set gridMargin(v: MaybeNum) { this._gridMb = this.asCss(v, 'px'); }
  @Input() set tileSize(v: MaybeNum) { this._tileSize = this.asCss(v, 'px'); }
  @Input() set tileRadius(v: MaybeNum) { this._tileRadius = this.asCss(v, 'px'); }
  @Input() set removeButtonSize(v: MaybeNum) { this._removeSize = this.asCss(v, 'px'); }
  @Input() set removeButtonOffset(v: MaybeNum) { this._removeOffset = this.asCss(v, 'px'); }

  // CVA wires
  private _onChange: (v: readonly any[]) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor(private dialog: Dialog) {}

  openPicker() {
    const ref = this.dialog.open<readonly any[] | undefined>(SelectionDialogComponent, {
      data: <SelectionDialogData>{
        title: this.addAriaLabel || 'Add',
        options$: this.options$,
        preselected: this._value,
        displayWith: this.displayWith,
        confirmLabel: 'Add',
        cancelLabel: 'Cancel',
      },
      hasBackdrop: true,
      disableClose: true,
      autoFocus: true,
      backdropClass: 'fancy-backdrop',
    });

    ref.closed.pipe(take(1)).subscribe(picked => {
      if (!picked?.length) { this._onTouched(); return; }
      const next = [...this._value];
      for (const item of picked) if (!this.contains(next, item)) next.push(item);
      this.commitUserChange(next);
    });
  }

  onRemove(item: any, ev?: MouseEvent) {
    ev?.stopPropagation();
    if (!this.canRemove || this.disabled) return;
    const next = this._value.filter(v => !this.compareWith(v, item));
    this.commitUserChange(next);
  }

  onChangeSize(size: 'small' | 'medium' | 'large') {
    switch (size) {
      case 'small':
        this.tileSize = 100; this.tileRadius = 4; this.removeButtonSize = 16; this.removeButtonOffset = 4;
        break;
      case 'medium':
        this.tileSize = 150; this.tileRadius = 8; this.removeButtonSize = 20; this.removeButtonOffset = 6;
        break;
      case 'large':
        this.tileSize = 200; this.tileRadius = 12; this.removeButtonSize = 24; this.removeButtonOffset = 8;
        break;
    }
  }

  // ---- CVA methods ----
  writeValue(v: readonly any[] | null): void {
    // Forms may write null on reset(); treat as empty array for the UI.
    this.setInternalValue(v ?? [], { fromWrite: true });
  }
  registerOnChange(fn: (value: readonly any[]) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  // ---- helpers ----
  private commitUserChange(next: readonly any[]) {
    this.setInternalValue(next, { fromWrite: false });
    this._onTouched(); // mark as touched on interaction
  }

  private setInternalValue(v: readonly any[], opts: { fromWrite: boolean }) {
    const next = Array.isArray(v) ? [...v] : [];
    this._value = next;
    if (!opts.fromWrite) {
      // Emit to both the Output for legacy bindings and to the FormControl.
      this.valueChange.emit(next);
      this._onChange(next);
    }
  }

  private contains(arr: readonly any[], el: any): boolean {
    for (const a of arr) if (this.compareWith(a, el)) return true;
    return false;
  }

  private asCss(v: MaybeNum, unit: string): string | undefined {
    if (v === undefined || v === null || (v as any) === '') return undefined;
    return typeof v === 'number' ? `${v}${unit}` : v;
  }

  trackByIndex = (i: number) => i;
}
