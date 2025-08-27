import { ProjectDto } from "@api/models";
import { createFeatureSelector } from "@ngrx/store";

export interface ProjectsState { 
    projects: ProjectDto[]; 
    loading: boolean; 
}

export const initialState: ProjectsState = { 
    projects: [], 
    loading: false 
};

export const getProjectDataState = createFeatureSelector<ProjectsState>('projects');
export const getSectionQueryResultEntities = (state: ProjectsState) => state.projects;
