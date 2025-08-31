import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest, map, startWith, take } from 'rxjs';

export interface SelectionDialogData {
  title: string;
  options$: Observable<readonly any[]>;
  preselected?: readonly any[];
  displayWith: (item: any) => string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-selection-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel" role="dialog" cdkTrapFocus>
      <div class="header">
        <div class="title">{{ data.title }}</div>
        <div class="count-badge" *ngIf="selectedCount > 0">{{ selectedCount }}</div>
      </div>

      <div class="body">
        <input
          type="search"
          [formControl]="filterCtrl"
          placeholder="Search..."
          autocomplete="off"
          aria-label="Filter items"
        />

        <div class="list" role="listbox" aria-multiselectable="true">
          <label
            class="row"
            *ngFor="let item of (filtered$ | async) ?? []; trackBy: trackByIndex"
            [class.disabled]="isDisabled(item)"
          >
            <input
              class="check"
              type="checkbox"
              [checked]="isSelected(item)"
              [disabled]="isDisabled(item)"
              (change)="toggle(item)"
              [attr.aria-label]="label(item)"
            />
            <span class="text">{{ label(item) }}</span>
          </label>

          <div class="empty" *ngIf="(filtered$ | async)?.length === 0">
            No items match your filter.
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="left">
          <button type="button" class="btn btn--ghost btn--sm" (click)="selectAll()" [disabled]="(filtered$ | async)?.length === 0">
            Select all
          </button>
          <button type="button" class="btn btn--ghost btn--sm" (click)="clearAll()" [disabled]="selectedCount === 0">
            Clear
          </button>
        </div>

        <div class="right">
          <button type="button" class="btn btn--ghost btn--sm" (click)="cancel()">
            {{ data.cancelLabel || 'Cancel' }}
          </button>
          <button type="button" class="btn btn--primary btn--sm" (click)="confirm()" [disabled]="selectedCount === 0">
            {{ data.confirmLabel || 'Add' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .panel {
      width: 500px;
      max-height: min(88vh, 760px);
      background:
        radial-gradient(1200px 320px at -10% -20%, rgba(229, 115, 115, .12), transparent 60%),
        linear-gradient(145deg, var(--bg-dark-1), var(--bg-dark-2));
      color: var(--text-main);
      border-radius: 16px;
      border: 1px solid var(--border-light);
      box-shadow:
        0 28px 68px rgba(0,0,0,.55),
        inset 0 1px 0 rgba(255,255,255,.05);
      display: grid;
      grid-template-rows: auto 1fr auto;
      overflow: hidden;
      animation: pop-in 160ms cubic-bezier(.2,.9,.2,1);
      backdrop-filter: saturate(115%) blur(1px);
    }

    .header {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 12px;
      padding: 18px 20px;
      border-bottom: 1px solid var(--border-light);
      background:
        linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,0));
    }
    .title { font-size: 18px; font-weight: 700; letter-spacing: .2px; }
    .count-badge {
      display: inline-grid;
      place-items: center;
      min-width: 28px;
      height: 28px;
      padding: 0 8px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 13px;
      color: #111;
      background: var(--accent);
      box-shadow: 0 4px 10px rgba(229, 115, 115, .35);
    }

    .body {
      padding: 16px 20px 6px 20px;
      display: grid;
      row-gap: 16px;
      overflow: hidden;
    }

    .list {
      overflow: auto;
      padding-right: 2px;
      height: 350px;
      display: flex;
      flex-direction: column;
      row-gap: 10px;

      label {
        height: fit-content;
      }
    }

    .row {
      display: grid;
      grid-template-columns: 24px 1fr;
      align-items: center;
      column-gap: 12px;
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid var(--border-light);
      background: linear-gradient(145deg, var(--bg-dark-1), var(--bg-dark-2));
      box-shadow: var(--shadow-inset);
      transition: transform .06s ease, border-color .2s ease, background .2s ease, box-shadow .2s ease;
      cursor: pointer;
    }
    .row:hover {
      border-color: rgba(229, 115, 115, 0.35);
      box-shadow:
        0 6px 14px rgba(0,0,0,.35),
        var(--shadow-inset);
      transform: translateY(-1px);
      background: linear-gradient(145deg, var(--bg-dark-focus-1), var(--bg-dark-focus-2));
    }
    .row.disabled {
      opacity: .6;
      cursor: not-allowed;
    }

    .check {
      appearance: none;
      width: 18px;
      height: 18px;
      margin: 0;
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,.35);
      background: transparent;
      display: grid;
      place-items: center;
      transition: background .2s ease, border-color .2s ease, box-shadow .2s ease;
    }
    .check:checked {
      background: var(--accent);
      border-color: var(--accent-active);
      box-shadow: 0 0 0 3px rgba(229, 115, 115, 0.25);
    }

    .text {
      font-size: 14px;
      line-height: 1.25;
      color: var(--text-main);
    }

    .empty {
      text-align: center;
      padding: 18px 8px 8px;
      font-size: 14px;
      color: var(--text-muted);
    }

    .footer {
      padding: 14px 14px;
      border-top: 1px solid var(--border-light);
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 10px;
      background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0));
      position: sticky;
      bottom: 0;
    }
    .left { display: flex; gap: 8px; align-items: center; }
    .right { display: flex; gap: 8px; align-items: center; }

    @keyframes pop-in {
      from { opacity: 0; transform: translateY(8px) scale(.985); }
      to   { opacity: 1; transform: none; }
    }

    @media (max-width: 680px) {
      .panel { width: 96vw; }
      .body { padding: 14px 14px 6px; }
      .footer { padding: 12px; }
    }
  `]
})
export class SelectionDialogComponent {
  filterCtrl = new FormControl<string>('', { nonNullable: true });
  private selected = new Set<any>();
  private disabled = new Set<any>(this.data.preselected ?? []);

  filtered$: Observable<readonly any[]> = combineLatest([
    this.data.options$,
    this.filterCtrl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([items, q]) => {
      const query = (q || '').toLowerCase().trim();
      if (!query) return items;
      return items.filter(i => (this.data.displayWith(i) || '').toLowerCase().includes(query));
    })
  );

  constructor(
    private ref: DialogRef<readonly any[] | undefined>,
    @Inject(DIALOG_DATA) public data: SelectionDialogData
  ) {}

  trackByIndex = (i: number) => i;
  label = (i: any) => this.data.displayWith(i);
  isDisabled = (i: any) => this.disabled.has(i);
  isSelected = (i: any) => this.selected.has(i);

  toggle(i: any) {
    if (this.isDisabled(i)) return;
    if (this.selected.has(i)) this.selected.delete(i);
    else this.selected.add(i);
  }

  get selectedCount() { return this.selected.size; }

  selectAll() {
    this.filtered$.pipe(take(1)).subscribe(list => {
      for (const i of list) if (!this.isDisabled(i)) this.selected.add(i);
    });
  }

  clearAll() { this.selected.clear(); }
  cancel() { this.ref.close(undefined); }
  confirm() { this.ref.close(Array.from(this.selected)); }
}
