import { ProjectDto } from "@api/models";
import { createAction, props } from "@ngrx/store";

export const LoadAllProjects = createAction(
  '[Projects] Load All Projects',
);

export const LoadAllProjectsSuccessful = createAction(
  '[Projects] Load All Projects Successful',
  props<{ projects: ProjectDto[] }>()
);