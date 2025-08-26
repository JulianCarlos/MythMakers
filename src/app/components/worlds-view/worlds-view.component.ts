import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ProjectDto } from '../../api/models/project-dto';
import { WorldDto } from '../../api/models/world-dto';
import { ModalService } from '../../core/modal/modal.service';
import { ViewListComponent } from '../../core/view-list/view-list.component';
import { first } from 'rxjs';

@Component({
  selector: 'app-worlds-view',
  standalone: true,
  imports: [CommonModule, ViewListComponent],
  templateUrl: './worlds-view.component.html',
  styleUrls: ['./worlds-view.component.scss'],
})
export class WorldsViewComponent {
  private modal = inject(ModalService);

  @Input() project?: ProjectDto;
  @Input() searchInput?: string;

  @Output() openWorld = new EventEmitter<number>();
  @Output() addWorldName = new EventEmitter<string>();
  @Output() removeWorldId = new EventEmitter<number>();

  get worlds(): readonly WorldDto[] {
    return this.project?.worlds ?? [];
  }

  get filteredWorlds(): readonly WorldDto[] {
    const q = (this.searchInput ?? '').trim();
    if (!q) return this.worlds;

    const needle = normalize(q);
    return this.worlds.filter((w) => normalize(w.name ?? '').includes(needle));
  }

  idOf = (w: WorldDto) => w.id;
  labelOf = (w: WorldDto) => w.name ?? '';
  onSelectWorld = (id: number) => this.openWorld.emit(id);
  onRemoveWorld = (id: number) => {
    this.modal
      .openConfirm({
        title: 'Delete project?',
        message: `This will permanently remove the world.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        danger: true,
      })
      .pipe(first())
      .subscribe((confirmed) => {
        if (confirmed){
          this.removeWorldId.emit(id);
        }
      });
  };
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