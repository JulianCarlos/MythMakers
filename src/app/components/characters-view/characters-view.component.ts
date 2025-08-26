import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ViewListComponent } from '../../core/view-list/view-list.component';
import { ModalService } from '../../core/modal/modal.service';
import { CharacterDto, ProjectDto } from '@api/models';
import { first } from 'rxjs';

@Component({
  selector: 'app-characters-view',
  standalone: true,
  imports: [ViewListComponent],
  templateUrl: './characters-view.component.html',
  styleUrl: './characters-view.component.scss',
})
export class CharactersViewComponent {
  private modal = inject(ModalService);

  @Input() project?: ProjectDto;
  @Input() searchInput?: string;

  @Output() openCharacter = new EventEmitter<number>();
  @Output() addCharacterName = new EventEmitter<string>();
  @Output() removeCharacterId = new EventEmitter<number>();

  get characters(): readonly CharacterDto[] {
    return this.project?.characters ?? [];
  }

  get filteredCharacters(): readonly CharacterDto[] {
    const q = (this.searchInput ?? '').trim();
    if (!q) return this.characters;

    const needle = normalize(q);
    return this.characters.filter((w) =>
      normalize(w.name ?? '').includes(needle),
    );
  }

  idOf = (c: CharacterDto) => c.id;
  labelOf = (c: CharacterDto) => c.name ?? '';
  onSelectCharacter = (id: number) => this.openCharacter.emit(id);
  onRemoveCharacter = (id: number) => {
      this.modal
        .openConfirm({
          title: 'Delete project?',
          message: `This will permanently remove the character.`,
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
          danger: true,
        })
        .pipe(first())
        .subscribe((confirmed) => {
          if (confirmed){
            this.removeCharacterId.emit(id);
          }
        });
    };
  onAddCharacter = () => {
    this.modal
      .openTextPrompt({
        title: 'New character',
        placeholder: 'Enter character name',
      })
      .subscribe((value) => {
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
