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
  }))
);

export function reducer(state: ProjectsState | undefined, action: Action): ProjectsState {
  return projectsReducerImpl(state, action);
}
