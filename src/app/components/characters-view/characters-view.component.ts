import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ViewListComponent } from '../../core/view-list/view-list.component';
import { ModalService } from '../../core/modal/modal.service';
import { Project } from '../../models/project';
import { Character } from '../../models/character';

@Component({
  selector: 'app-characters-view',
  standalone: true,
  imports: [ViewListComponent],
  templateUrl: './characters-view.component.html',
  styleUrl: './characters-view.component.scss'
})
export class CharactersViewComponent {
  private modal = inject(ModalService);

  @Input() project?: Project;
  @Input() searchInput?: string;

  @Output() openCharacter = new EventEmitter<string>();
  @Output() addCharacterName = new EventEmitter<string>();
  @Output() removeCharacterId = new EventEmitter<string>();

  get characters(): readonly Character[] {
    return this.project?.characters ?? [];
  }

  get filteredCharacters(): readonly Character[] {
    const q = (this.searchInput ?? '').trim();
    if (!q) return this.characters;

    const needle = normalize(q);
    return this.characters.filter(w => normalize(w.name ?? '').includes(needle));
  }

  idOf = (c: Character) => c.id;
  labelOf = (c: Character) => c.name ?? '';
  onSelectCharacter = (id: string) => this.openCharacter.emit(id);
  onRemoveCharacter = (id: string) => this.removeCharacterId.emit(id);
  onAddCharacter = () => {
    this.modal.openTextPrompt({ title: 'New character', placeholder: 'Enter character name' })
      .subscribe(value => {
        const trimmed = value?.trim();
        if (trimmed) this.addCharacterName.emit(trimmed);
      });
  };
}

function normalize(s: string): string {
  return (s ?? '')
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}