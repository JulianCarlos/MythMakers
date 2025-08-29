import { Action, createReducer, on } from '@ngrx/store';
import * as fromActions from 'store/actions/project.action';
import * as fromState from 'store/states/project.state';
import { ProjectsState } from 'store/states/project.state';

const projectsReducerImpl = createReducer(
  fromState.initialState,

  // Load
  on(fromActions.LoadAllProjects, state => ({ ...state, loading: true })),
  on(fromActions.LoadAllProjectsSuccessful, (state, { projects }) => ({
    ...state,
    loading: false,
    projects,
  })),

  // Create
  on(fromActions.CreateProject, state => ({ ...state, loading: true })),
  on(fromActions.CreateProjectSuccessful, (state, { project }) => {
    const exists = state.projects.some(p => p.id === project.id);
    return {
      ...state,
      loading: false,
      projects: exists
        ? state.projects.map(p => (p.id === project.id ? project : p))
        : [...state.projects, project],
    };
  }),

  // Update
  on(fromActions.UpdateProject, state => ({ ...state, loading: true })),
  on(fromActions.UpdateProjectSuccessful, (state, { project }) => ({
    ...state,
    loading: false,
    projects: state.projects.map(p => (p.id === project.id ? project : p)),
  })),

  // Delete
  on(fromActions.DeleteProjectById, state => ({ ...state, loading: true })),
  on(fromActions.DeleteProjectByIdSuccess, (state, { projectId }) => ({
    ...state,
    loading: false,
    projects: state.projects.filter(p => p.id !== projectId),
  })),

  on(
    fromActions.UpdateProjectPropertyById,
    (state, { projectId, property, propertyId, value }) => {
      let changed = false;

      const projects = state.projects.map(project => {
        if (+project.id !== +projectId) {
          return project;
        }

        const list: any[] = (project as any)[property];
        const idx = list.findIndex(e => +e.id === +propertyId);
        const curr = list[idx];

        const patch = value ?? {};
        const willChange = Object.keys(patch).some(k => curr[k] !== (patch as any)[k]);

        if (!willChange) {
          return project;
        }

        const updatedItem = { ...curr, ...patch };
        const updatedList = [...list];
        updatedList[idx] = updatedItem;

        changed = true;
        
        return { ...project, [property]: updatedList };
      });

      return changed ? { ...state, projects } : state;
    }
  ),
);

export function reducer(state: ProjectsState | undefined, action: Action): ProjectsState {
  return projectsReducerImpl(state, action);
}
