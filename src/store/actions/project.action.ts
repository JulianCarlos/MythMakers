import { ProjectDto } from "@api/models";
import { createAction, props } from "@ngrx/store";

/* Get */
export const LoadAllProjects = createAction(
  '[Projects] Load All Projects',
);

export const LoadAllProjectsSuccessful = createAction(
  '[Projects] Load All Projects Successful',
  props<{ projects: ProjectDto[] }>()
);

/* Create Or Update */
export const CreateOrUpdateProject = createAction(
  '[Projects] Create Or Update Projects',
  props<{ project: ProjectDto }>()
);

export const CreateOrUpdateProjectSuccessful = createAction(
  '[Projects] Create Or Update Projects Successful',
  props<{ project: ProjectDto }>()
);

/* Delete */
export const DeleteProjectById = createAction(
  '[Projects] Delete Project By Id',
  props<{ projectId: number }>()
);

export const DeleteProjectByIdSuccess = createAction(
  '[Projects] Delete Project By Id Successful',
  props<{ projectId: number }>()
);
