import { ProjectDto } from "@api/models";
import { createAction, props } from "@ngrx/store";
import { ProjectAttributeType } from "app/enums/project-attribute-type";

/* Get */
export const LoadAllProjects = createAction(
  '[Projects] Load All Projects',
);

export const LoadAllProjectsSuccessful = createAction(
  '[Projects] Load All Projects Successful',
  props<{ projects: ProjectDto[] }>()
);

/* Create */
export const CreateProject = createAction(
  '[Projects] Create Projects',
  props<{ project: ProjectDto }>()
);

export const CreateProjectSuccessful = createAction(
  '[Projects] Create Projects Successful',
  props<{ project: ProjectDto }>()
);

/* Update */
export const UpdateProject = createAction(
  '[Projects] Update Projects',
  props<{ project: ProjectDto }>()
);

export const UpdateProjectSuccessful = createAction(
  '[Projects] Update Projects Successful',
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

export const UpdateProjectPropertyById = createAction(
  '[Projects] Update Project Property By Id',
  props<{
    projectId: number;
    propertyId: number;
    property: ProjectAttributeType;
    value: any;
  }>()
);

