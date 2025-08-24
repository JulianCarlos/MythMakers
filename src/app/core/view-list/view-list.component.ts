import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  HostBinding,
  Input,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

type MaybeNum = number | string;

@Component({
  selector: 'app-view-list',
  standalone: true,
  imports: [
    CommonModule,
    CommonModule,
    MatButtonModule,
    MatMenu,
    MatIcon,
    MatMenuTrigger,
    MatMenuItem,
  ],
  templateUrl: './view-list.component.html',
  styleUrls: ['./view-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewListComponent {
  @Input() canAdd = true;
  @Input() canRemove = false;

  @Input({ required: true }) title!: string;
  @Input({ required: true }) items: ReadonlyArray<unknown> = [];
  @Input({ required: true }) idOf!: (item: any) => string;
  @Input() labelOf: (item: any) => string = (i: any) =>
    i?.name ?? i?.title ?? '';
  @Input() selectId!: (id: string) => void;
  @Input() removeId!: (id: string) => void;
  @Input() addClick!: () => void;

  @Input() removeAriaLabel = 'Remove';
  @Input() addAriaLabel = 'Add';

  @HostBinding('style.--grid-gap') private _gridGap?: string;
  @HostBinding('style.--grid-mb') private _gridMb?: string;
  @HostBinding('style.--tile-size') private _tileSize?: string;
  @HostBinding('style.--tile-radius') private _tileRadius?: string;
  @HostBinding('style.--remove-size') private _removeSize?: string;
  @HostBinding('style.--remove-offset') private _removeOffset?: string;

  @Input() set gap(v: MaybeNum) {
    this._gridGap = this.asCss(v, 'px');
  }
  @Input() set gridMargin(v: MaybeNum) {
    this._gridMb = this.asCss(v, 'px');
  }
  @Input() set tileSize(v: MaybeNum) {
    this._tileSize = this.asCss(v, 'px');
  }
  @Input() set tileRadius(v: MaybeNum) {
    this._tileRadius = this.asCss(v, 'px');
  }
  @Input() set removeButtonSize(v: MaybeNum) {
    this._removeSize = this.asCss(v, 'px');
  }
  @Input() set removeButtonOffset(v: MaybeNum) {
    this._removeOffset = this.asCss(v, 'px');
  }

  @Input() itemButtonClass = 'btn btn--icon btn--primary';
  @Input() addButtonClass = 'btn btn--icon btn--outline';
  @Input() tileBackground?: string;

  @ContentChild('item', { read: TemplateRef }) itemTpl?: TemplateRef<{
    $implicit: any;
  }>;

  trackItem = (_: number, item: any) => this.idOf(item);

  onSelect(item: any) {
    const id = this.idOf(item);
    this.selectId?.(id);
  }

  onRemove(item: any, ev?: MouseEvent) {
    ev?.stopPropagation();
    if (!this.canRemove) return;
    const id = this.idOf(item);
    this.removeId?.(id);
  }

  onAdd() {
    if (!this.canAdd) return;
    this.addClick?.();
  }

  onChangeSize(size: 'small' | 'medium' | 'large') {
    switch (size) {
      case 'small':
        this.tileSize = 100;
        this.tileRadius = 4;
        this.removeButtonSize = 16;
        this.removeButtonOffset = 4;
        break;
      case 'medium':
        this.tileSize = 150;
        this.tileRadius = 8;
        this.removeButtonSize = 20;
        this.removeButtonOffset = 6;
        break;
      case 'large':
        this.tileSize = 200;
        this.tileRadius = 12;
        this.removeButtonSize = 24;
        this.removeButtonOffset = 8;
        break;
    }
  }

  private asCss(v: MaybeNum, unit: string): string | undefined {
    if (v === undefined || v === null || (v as any) === '') return undefined;
    return typeof v === 'number' ? `${v}${unit}` : v;
  }
}
