// projects-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Project } from '../models/project';
import { World } from '../models/world';
import { City } from '../models/city';
import { Character } from '../models/character';
import { moveItemInArray } from '@angular/cdk/drag-drop'; // ⬅️ add this

function genId(): string {
  return globalThis.crypto?.randomUUID?.() ?? Date.now().toString();
}

type EntityKey = 'worlds' | 'countries' | 'cities' | 'characters';
type BaseInput = { name: string; description?: string };

@Injectable({ providedIn: 'root' })
export class ProjectsStateService {
  private readonly _projects$ = new BehaviorSubject<Project[]>([]);
  readonly projects$ = this._projects$.asObservable();

  seedDemoIfEmpty(): void {
    if (this._projects$.value.length === 0) {
      this._projects$.next([
        { id: '0', name: 'Project Alpha', worlds: [], cities: [], characters: [] },
        { id: '1', name: 'Project Beta',  worlds: [], cities: [], characters: [] },
        { id: '2', name: 'Project Gamma', worlds: [], cities: [], characters: [] }
      ]);
    }
  }

  getSnapshot(): Project[] {
    return this._projects$.value;
  }

  addProject(name: string): Project {
    const project: Project = { id: genId(), name, worlds: [], cities: [], characters: [] };
    this._projects$.next([project, ...this._projects$.value]);
    return project;
  }

  upsert(project: Project): void {
    const ps = this._projects$.value;
    const i = ps.findIndex(x => x.id === project.id);
    this._projects$.next(i === -1 ? [project, ...ps] : ps.map(x => (x.id === project.id ? project : x)));
  }

  renameProject(id: string, name: string): void {
    this._projects$.next(this._projects$.value.map(p => (p.id === id ? { ...p, name } : p)));
  }

  deleteProject(id: string): void {
    this._projects$.next(this._projects$.value.filter(p => p.id !== id));
  }

  /** ⬇️ New: reorder projects and emit */
  reorderProjects(previousIndex: number, currentIndex: number): void {
    const copy = [...this._projects$.value];
    moveItemInArray(copy, previousIndex, currentIndex);
    this._projects$.next(copy);
  }

  private updateProjects(mutator: (projects: Project[]) => Project[]): void {
    this._projects$.next(mutator(this._projects$.value));
  }

  private updateProject(projectId: string, mutator: (p: Project) => Project): void {
    this.updateProjects(ps => ps.map(p => (p.id === projectId ? mutator(p) : p)));
  }

  private buildEntity(projectId: string, key: EntityKey, input: BaseInput): World | City | Character {
    const base = {
      id: genId(),
      name: input.name,
      description: input.description ?? '',
      createdAt: new Date()
    };

    if (key === 'characters') {
      return base as Character;
    }

    return { ...base, projectId } as World | City;
  }

  addEntity(projectId: string, key: EntityKey, input: BaseInput): World | City | Character {
    const entity = this.buildEntity(projectId, key, input);

    this.updateProject(projectId, p => ({
      ...p,
      [key]: [...(p[key] ?? []), entity] as Project[typeof key]
    }));

    return entity;
  }

  addWorld(projectId: string, world: BaseInput): World {
    return this.addEntity(projectId, 'worlds', world) as World;
  }

  addCity(projectId: string, city: BaseInput): City {
    return this.addEntity(projectId, 'cities', city) as City;
  }

  addCharacter(projectId: string, character: BaseInput): Character {
    return this.addEntity(projectId, 'characters', character) as Character;
  }
}
