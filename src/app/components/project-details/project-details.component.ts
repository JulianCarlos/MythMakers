import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, startWith, takeUntil } from 'rxjs/operators';
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
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  @Input({ required: true }) projectId!: string;

  protected form: FormGroup = this.fb.group({ siteSearch: [''] });
  protected searchQuery = '';

  private readonly projects$ = this.store.select(fromSelectors.getProjectsStateProjects);

  readonly projectId$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    startWith(null),
    map(() => this.getRouteParam(['projectId', 'id'])),
    map(v => (v == null ? NaN : Number(v))),
    filter(Number.isInteger),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly project$ = combineLatest([this.projectId$, this.projects$]).pipe(
    map(([id, projects]) => (Array.isArray(projects) ? projects.find(p => p.id === id) ?? null : null)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ngOnInit(): void {
    this.form.get('siteSearch')!
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => { this.searchQuery = (v ?? '').toString(); });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addCharacter(project: ProjectDto, name: string): void {
    this.add(project, 'characters', name);
  }

  addCity(project: ProjectDto, name: string): void {
    this.add(project, 'cities', name);
  }

  addCountry(project: ProjectDto, name: string): void {
    this.add(project, 'countries', name);
  }

  addWorld(project: ProjectDto, name: string): void {
    this.add(project, 'worlds', name);
  }

  openCharacter(characterId: number): void {
    this.open('character', characterId);
  }

  openCity(cityId: number): void {
    this.open('city', cityId);
  }

  openCountry(countryId: number): void {
    this.open('country', countryId);
  }

  openWorld(worldId: number): void {
    this.open('world', worldId);
  }

  removeCharacter(project: ProjectDto, characterId: number): void {
    this.remove(project, 'characters', characterId);
  }

  removeCity(project: ProjectDto, cityId: number): void {
    this.remove(project, 'cities', cityId);
  }

  removeCountry(project: ProjectDto, countryId: number): void {
    this.remove(project, 'countries', countryId);
  }

  removeWorld(project: ProjectDto, worldId: number): void {
    this.remove(project, 'worlds', worldId);
  }

  private add(project: ProjectDto, key: EntityKey, name: string): void {
    const n = (name ?? '').trim();
    if (!n) return;
    const arr = Array.isArray(project[key]) ? (project[key] as any[]) : [];
    const updated: ProjectDto = { ...project, [key]: [...arr, { id: 0, name: n }] };
    this.store.dispatch(fromActions.UpdateProject({ project: updated }));
  }

  private open(path: 'world' | 'country' | 'city' | 'character', id: number): void {
    this.router.navigate([path, id], { relativeTo: this.route });
  }

  private remove(project: ProjectDto, key: EntityKey, id: number): void {
    const arr = Array.isArray(project[key]) ? (project[key] as any[]) : [];
    const updated: ProjectDto = { ...project, [key]: arr.filter((e: any) => e?.id !== id) };
    this.store.dispatch(fromActions.UpdateProject({ project: updated }));
  }

  private getRouteParam(names: string[]): string | null {
    const maps = this.route.pathFromRoot.map(r => r.snapshot.paramMap);
    for (let i = maps.length - 1; i >= 0; i--) {
      for (const n of names) {
        const v = maps[i].get(n);
        if (v !== null) return v;
      }
    }
    return null;
  }
}
