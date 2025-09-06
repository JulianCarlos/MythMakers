import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CharacterDto, CharacterRelationDto, ProjectDto, RelationType } from '@api/models';
import { Store } from '@ngrx/store';
import { createFormGroupFromClass } from 'app/core/form-group.factory';
import { CharacterDetailFormType } from 'app/core/form-types/character-detail-form-type';
import { ModalService } from 'app/core/modal/modal.service';
import { SelectionGridComponent } from 'app/core/selection-grid/selection-grid.component';
import { filter, first, Observable, withLatestFrom } from 'rxjs';
import * as fromActions from 'store/actions/project.action';
import * as fromSelectors from 'store/selectors/project.selector';

@Component({
  selector: 'app-character-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIcon, DialogModule, SelectionGridComponent],
  templateUrl: './character-details.component.html',
  styleUrls: ['./character-details.component.scss'],
})
export class CharacterDetailsComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() projectId!: number;
  @Input() characterId!: number;

  protected datasource!: Observable<CharacterDto[]>;
  protected selectedCharacter?: CharacterDto | null;
  private selectedProject?: ProjectDto | null;

  protected displayCharacter = (c: CharacterDto) => c?.name ?? c?.nickName ?? `#${c?.id ?? ''}`;

  protected form = createFormGroupFromClass(CharacterDetailFormType, {
    overrides: {
      family: () => new FormControl<CharacterDto[]>([]),
      friends: () => new FormControl<CharacterDto[]>([]),
    },
    validators: {
      height: Validators.min(0),
      weight: Validators.min(0),
    },
  });

  private totalCharacters: CharacterDto[] = [];
  private characterById = new Map<number, CharacterDto>();

  ngOnInit(): void {
    this.datasource = this.store.select(
      fromSelectors.getProjectsStateProjectProperty(this.projectId, 'characters')
    );

    this.datasource.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((chars) => {
      this.totalCharacters = chars ?? [];
      this.characterById = new Map(this.totalCharacters.map((c) => [c.id, c] as const));
    });

    const project$ = this.store
      .select(fromSelectors.getProjectsStateProjectById(this.projectId))
      .pipe(filter((p): p is ProjectDto => !!p));

    const character$ = this.store
      .select(fromSelectors.getSelectedProjectProperty('characters', this.characterId))
      .pipe(filter((w): w is CharacterDto => !!w));

    character$.pipe(withLatestFrom(project$), takeUntilDestroyed(this.destroyRef)).subscribe(([character, project]) => {
      this.selectedProject = project;
      this.selectedCharacter = character;

      this.form.reset(
        {
          ...character,
          family: this.fromRelationToCharacter(character.relation, RelationType.Family),
          friends: this.fromRelationToCharacter(character.relation, RelationType.Friend),
        },
        { emitEvent: false }
      );

      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  backToProject() {
    if (this.form.dirty) {
      this.modal
        .openConfirm({
          title: 'Unsaved Changes?',
          message: 'You have unsaved changes. Are you sure you want to leave without saving?',
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
          danger: true,
        })
        .pipe(first())
        .subscribe((confirmed) => {
          if (!confirmed) return;
          this.router.navigate(['/overview/project', this.projectId]);
        });
    } else {
      this.router.navigate(['/overview/project', this.projectId]);
    }
  }

  applyChanges() {
    if (!this.selectedProject || !this.selectedCharacter) return;
    if (this.form.invalid || this.form.pristine) return;

    const { friends, family } = this.form.value;

    const relation: CharacterRelationDto[] = [
      ...this.fromCharacterToRelation(family, RelationType.Family),
      ...this.fromCharacterToRelation(friends, RelationType.Friend),
    ];
    
    const updatedCharacter: CharacterDto = {
      ...this.selectedCharacter,
      ...this.form.value,
      relation: relation,
    };

    const updatedCharacters = (this.selectedProject.characters ?? []).map((w) =>
      w.id === updatedCharacter.id ? { ...w, ...updatedCharacter } : w
    );

    this.store.dispatch(
      fromActions.UpdateProject({
        project: {
          ...this.selectedProject,
          characters: updatedCharacters,
        },
      })
    );

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  fromCharacterToRelation(
    characters: CharacterDto[],
    relationType: RelationType = RelationType.Friend
  ): CharacterRelationDto[] {
    if (!this.selectedCharacter?.id) return [];

    return characters.map(({ id }) => ({
      characterFromId: this.selectedCharacter!.id,
      characterToId: id,
      relationType,
    }));
  }

  fromRelationToCharacter(
    relations: CharacterRelationDto[] = [],
    relationType: RelationType = RelationType.Friend
  ): CharacterDto[] {
    if (!relations.length || !this.totalCharacters.length) return [];

    return relations
      .filter(
        (r): r is CharacterRelationDto & { characterToId: number } =>
          r.relationType === relationType && typeof r.characterToId === 'number'
      )
      .map((r) => this.characterById.get(r.characterToId))
      .filter((c): c is CharacterDto => !!c);
  }
}
