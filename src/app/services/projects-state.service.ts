import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Project } from '../models/project';

// Optional: export World if you want to use it elsewhere
export interface World {
  id: string;
  name: string;
  description: string;
  cities: any[];
  projectId: string;
  createdAt: Date;
}

function genId(): string {
  return globalThis.crypto?.randomUUID?.() ?? Date.now().toString();
}

@Injectable({ providedIn: 'root' })
export class ProjectsStateService {
  private readonly _projects$ = new BehaviorSubject<Project[]>([]);
  /** Expose as read-only observable */
  readonly projects$ = this._projects$.asObservable();

  /** One-time demo seed */
  seedDemoIfEmpty(): void {
    if (this._projects$.value.length === 0) {
      this._projects$.next([
        { id: '0', name: 'Project Alpha', worlds: [] },
        { id: '1', name: 'Project Beta',  worlds: [] },
        { id: '2', name: 'Project Gamma', worlds: [] }
      ]);
    }
  }

  /** Snapshot for imperative reads */
  getSnapshot(): Project[] {
    return this._projects$.value;
  }

  /** Create project */
  addProject(name: string): Project {
    const project: Project = { id: genId(), name, worlds: [] };
    this._projects$.next([project, ...this._projects$.value]);
    return project;
  }

  /** Upsert full project */
  upsert(project: Project): void {
    const ps = this._projects$.value;
    const i = ps.findIndex(x => x.id === project.id);
    this._projects$.next(i === -1 ? [project, ...ps] : ps.map(x => x.id === project.id ? project : x));
  }

  /** Rename by id */
  renameProject(id: string, name: string): void {
    this._projects$.next(this._projects$.value.map(p => p.id === id ? { ...p, name } : p));
  }

  /** Delete by id */
  deleteProject(id: string): void {
    this._projects$.next(this._projects$.value.filter(p => p.id !== id));
  }

  /**
   * Add a world by giving only the editable fields.
   * The service fills in id/projectId/createdAt for you.
   */
  addWorld(
    projectId: string,
    world: { name: string; description?: string; cities?: any[] }
  ): World {
    const newWorld: World = {
      id: genId(),
      name: world.name,
      description: world.description ?? '',
      cities: world.cities ?? [],
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
}
