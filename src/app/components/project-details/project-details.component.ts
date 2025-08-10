import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { Project } from '../../models/project';
import { WorldsViewComponent } from '../worlds-view/worlds-view.component';
import { ProjectsStateService } from '../../services/projects-state.service';
import { CitiesViewComponent } from '../cities-view/cities-view.component';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WorldsViewComponent, CitiesViewComponent, AsyncPipe],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDetailsComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private state = inject(ProjectsStateService);

  form: FormGroup = this.fb.group({});

  project$ = combineLatest([
    this.state.projects$,
    this.route.paramMap.pipe(map(p => p.get('projectId')))
  ]).pipe(map(([projects, id]) => projects.find(p => p.id === id)));

  addWorld(project: Project, name: string) {
    const trimmed = name?.trim();
    if (!trimmed) return;
    this.state.addWorld(project.id, { name: trimmed, description: '' });
  }

  addCity(project: Project, name: string) {
    const trimmed = name?.trim();
    if (!trimmed) return;
    this.state.addCity(project.id, { name: trimmed, description: '' });
  }

  openWorld(worldId: string) {
    this.router.navigate(['world', worldId], { relativeTo: this.route });
  }

  openCity(cityId: string) {
    this.router.navigate(['city', cityId], { relativeTo: this.route });
  }
}
