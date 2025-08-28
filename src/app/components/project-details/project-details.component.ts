import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { ProjectDto } from '../../api/models/project-dto';
import { CharactersViewComponent } from '../characters-view/characters-view.component';
import { CitiesViewComponent } from '../cities-view/cities-view.component';
import { CountriesViewComponent } from '../countries-view/countries-view.component';
import { WorldsViewComponent } from '../worlds-view/worlds-view.component';

import * as fromActions from 'store/actions/project.action';
import * as fromSelectors from 'store/selectors/project.selector';

type EntityKey = 'worlds' | 'countries' | 'cities' | 'characters';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AsyncPipe,
    WorldsViewComponent,
    CitiesViewComponent,
    CharactersViewComponent,
    CountriesViewComponent,
  ],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly destroy$ = new Subject<void>();

  protected form: FormGroup = this.fb.group({});

  protected searchInput = '';

  private projects$ = this.store.select(fromSelectors.getProjectsStateProjects);

  private projectId$ = this.route.paramMap.pipe(
    map((paramMap: ParamMap) => {
      const id = Number(paramMap.get('projectId'));
      return id;
    }),
    filter((id: number) => {
      return !Number.isNaN(id);
    }),
    distinctUntilChanged((a: number, b: number) => {
      return a === b;
    })
  );

  project$ = combineLatest([this.projectId$, this.projects$]).pipe(
    map(([id, projects]: [number, ProjectDto[]]) => {
      if (!Array.isArray(projects)) {
        return null;
      }
      const found = projects.find((p: ProjectDto) => {
        return p.id === id;
      });
      return found ?? null;
    }),
    filter((p: ProjectDto | null): p is ProjectDto => {
      return p !== null;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ngOnInit(): void {
    this.form = this.fb.group({ siteSearch: [''] });

    this.form.get('siteSearch')!
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: unknown) => {
        this.searchInput = (value ?? '').toString();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private add(project: ProjectDto, key: EntityKey, name: string): void {
    const trimmed = name ? name.trim() : '';
    if (!trimmed) {
      return;
    }

    const arr = Array.isArray(project[key]) ? (project[key] as any[]) : [];
    const newEntity = { id: 0, name: trimmed };

    const updated: ProjectDto = {
      ...project,
      [key]: [...arr, newEntity],
    };

    this.store.dispatch(fromActions.CreateOrUpdateProject({ project: updated }));
  }

  private remove(project: ProjectDto, key: EntityKey, id: number): void {
    const arr = Array.isArray(project[key]) ? (project[key] as any[]) : [];

    const updated: ProjectDto = {
      ...project,
      [key]: arr.filter((e: any) => {
        return e?.id !== id;
      }),
    };

    this.store.dispatch(fromActions.CreateOrUpdateProject({ project: updated }));
  }

  private open(path: 'world' | 'country' | 'city' | 'character', id: number): void {
    this.router.navigate([path, id], { relativeTo: this.route });
  }

  addWorld(project: ProjectDto, name: string): void {
    this.add(project, 'worlds', name);
  }
  removeWorld(project: ProjectDto, worldId: number): void {
    this.remove(project, 'worlds', worldId);
  }

  addCountry(project: ProjectDto, name: string): void {
    this.add(project, 'countries', name);
  }
  removeCountry(project: ProjectDto, countryId: number): void {
    this.remove(project, 'countries', countryId);
  }

  addCity(project: ProjectDto, name: string): void {
    this.add(project, 'cities', name);
  }
  removeCity(project: ProjectDto, cityId: number): void {
    this.remove(project, 'cities', cityId);
  }

  addCharacter(project: ProjectDto, name: string): void {
    this.add(project, 'characters', name);
  }
  removeCharacter(project: ProjectDto, characterId: number): void {
    this.remove(project, 'characters', characterId);
  }

  openWorld(worldId: number): void {
    this.open('world', worldId);
  }
  openCountry(countryId: number): void {
    this.open('country', countryId);
  }
  openCity(cityId: number): void {
    this.open('city', cityId);
  }
  openCharacter(characterId: number): void {
    this.open('character', characterId);
  }
}
