import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-list.component.html',
  styleUrls: ['./view-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewListComponent {
  @Input() canAdd = true;
  @Input() canRemove = false;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) items: ReadonlyArray<unknown> = [];
  @Input({ required: true }) idOf!: (item: any) => string;
  @Input() labelOf: (item: any) => string = (i: any) => i?.name ?? i?.title ?? '';
  @Input() selectId!: (id: string) => void;
  @Input() removeId!: (id: string) => void;
  @Input() addClick!: () => void;

  @ContentChild('item', { read: TemplateRef }) itemTpl?: TemplateRef<{ $implicit: any }>;

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
}
