import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Project } from '../../models/project';
import { World } from '../../models/world';
import { ModalService } from '../../core/modal/modal.service';
import { ViewListComponent } from '../../core/view-list/view-list.component';

@Component({
  selector: 'app-worlds-view',
  standalone: true,
  imports: [CommonModule, ViewListComponent],
  templateUrl: './worlds-view.component.html',
  styleUrls: ['./worlds-view.component.scss'],
})
export class WorldsViewComponent {
  private modal = inject(ModalService);

  @Input() project?: Project;
  @Input() searchInput?: string;

  @Output() openWorld = new EventEmitter<string>();
  @Output() addWorldName = new EventEmitter<string>();
  @Output() removeWorldId = new EventEmitter<string>();

  get worlds(): readonly World[] {
    return this.project?.worlds ?? [];
  }

  get filteredWorlds(): readonly World[] {
    const q = (this.searchInput ?? '').trim();
    if (!q) return this.worlds;

    const needle = normalize(q);
    return this.worlds.filter((w) => normalize(w.name ?? '').includes(needle));
  }

  idOf = (w: World) => w.id;
  labelOf = (w: World) => w.name ?? '';
  onSelectWorld = (id: string) => this.openWorld.emit(id);
  onRemoveWorld = (id: string) => this.removeWorldId.emit(id);
  onAddWorld = () => {
    this.modal
      .openTextPrompt({ title: 'New world', placeholder: 'Enter world name' })
      .subscribe((value) => {
        const trimmed = value?.trim();
        if (trimmed) this.addWorldName.emit(trimmed);
      });
  };
}

function normalize(s: string): string {
  return (s ?? '')
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
