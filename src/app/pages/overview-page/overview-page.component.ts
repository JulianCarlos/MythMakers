import { Component } from '@angular/core';
import { ProjectOverviewListItemComponent } from "../../components/project-overview-list-item/project-overview-list-item.component";
import { Project } from '../../models/project';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ModalService } from '../../core/modal/modal.service';
import { ProjectDetailsComponent } from "../../components/project-details/project-details.component";

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [ProjectOverviewListItemComponent, MatIconModule, MatButtonModule, ProjectDetailsComponent],
  templateUrl: './overview-page.component.html',
  styleUrl: './overview-page.component.scss'
})
export class OverviewPageComponent {
  projects: Project[] = [
    { id: '1', name: 'Project Alpha' },
    { id: '2', name: 'Project Beta' },
    { id: '3', name: 'Project Gamma' }
  ];

  protected selectedProject?: Project;

  constructor(private modal: ModalService) {}

  onAddProject() {
    this.modal.openTextPrompt({ title: 'New project', placeholder: 'Enter project name' })
      .subscribe(value => {
        if (!value) return;
        this.projects = [{ id: Date.now().toString(), name: value }, ...this.projects];
      });
  }

  onEditProject(project: Project) {
    this.modal.openTextPrompt({
      title: `Rename "${project.name}"`,
      placeholder: 'Enter new name',
      initialValue: project.name
    }).subscribe(value => {
      if (!value) return;
      this.projects = this.projects.map(p =>
        p.id === project.id ? { ...p, name: value } : p
      );

      if (this.selectedProject?.id === project.id) {
        this.selectedProject = this.projects.find(p => p.id === project.id);
      }
    });
  }

  onDeleteProject(project: Project) {
    this.modal.openConfirm({
      title: 'Delete project?',
      message: `This will permanently remove "${project.name}".`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      danger: true
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.projects = this.projects.filter(p => p.id !== project.id);
    });
  }

  onProjectSelected(project: Project) {
    this.selectedProject = project;
  }
}
