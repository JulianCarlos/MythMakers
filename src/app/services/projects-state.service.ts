import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Project } from '../models/project';
import { World } from '../models/world';
import { City } from '../models/city';
import { Character } from '../models/character';

function genId(): string {
  return globalThis.crypto?.randomUUID?.() ?? Date.now().toString();
}

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
    const project: Project = { id: genId(), name, worlds: [], cities: [] };
    this._projects$.next([project, ...this._projects$.value]);
    return project;
  }

  upsert(project: Project): void {
    const ps = this._projects$.value;
    const i = ps.findIndex(x => x.id === project.id);
    this._projects$.next(i === -1 ? [project, ...ps] : ps.map(x => x.id === project.id ? project : x));
  }

  renameProject(id: string, name: string): void {
    this._projects$.next(this._projects$.value.map(p => p.id === id ? { ...p, name } : p));
  }

  deleteProject(id: string): void {
    this._projects$.next(this._projects$.value.filter(p => p.id !== id));
  }

  addWorld(projectId: string, world: { name: string; description?: string }): World {
    const newWorld: World = {
      id: genId(),
      name: world.name,
      description: world.description ?? '',
      projectId,
      createdAt: new Date()
    };

    this._projects$.next(
      this._projects$.value.map(p =>
        p.id === projectId ? { ...p, worlds: [...(p.worlds ?? []), newWorld] } : p
      )
    );

    return newWorld;
  }

  addCity(projectId: string, city: { name: string; description?: string }): City {
    const newCity: City = {
      id: genId(),
      name: city.name,
      description: city.description ?? '',
      projectId,
      createdAt: new Date()
    };

    this._projects$.next(
      this._projects$.value.map(p =>
        p.id === projectId ? { ...p, cities: [...(p.cities ?? []), newCity] } : p
      )
    );

    return newCity;
  }

  addCharacter(projectId: string, character: { name: string; description?: string }): Character {
    const newCharacter: Character = {
      id: genId(),
      name: character.name,
      description: character.description ?? '',
      createdAt: new Date()
    };

    this._projects$.next(
      this._projects$.value.map(p =>
        p.id === projectId ? { ...p, characters: [...(p.characters ?? []), newCharacter] } : p
      )
    );

    return newCharacter;
  }
}
