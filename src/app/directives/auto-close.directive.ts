import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appAutoClose]',
})
export class AutoCloseDirective {
  @Input() closeOnOutsideClick = true;
  @Input() closeOnEscape = true;

  @Output() autoClose = new EventEmitter<void>();

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.closeOnOutsideClick) return;
    const target = e.target as Node | null;
    if (target && !this.el.nativeElement.contains(target)) {
      this.autoClose.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.closeOnEscape) this.autoClose.emit();
  }
}
