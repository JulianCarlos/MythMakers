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

  @Output() openCharacter = new EventEmitter<string>();
  @Output() addCharacterName = new EventEmitter<string>();
  @Output() removeCharacterId = new EventEmitter<string>();

  get characters(): readonly Character[] {
    return this.project?.characters ?? [];
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
