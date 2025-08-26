import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { ProjectOverviewListItemComponent } from '../../components/project-overview-list-item/project-overview-list-item.component';
import { ProjectDto } from '../../api/models/project-dto';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ModalService } from '../../core/modal/modal.service';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { ProjectsService } from '../../api/services/projects.service';
import { AsyncPipe } from '@angular/common';
import { take, first, switchMap } from 'rxjs/operators';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [
    ProjectOverviewListItemComponent,
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
    AsyncPipe,
    CdkDropList,
    CdkDrag,
  ],
  templateUrl: './overview-page.component.html',
  styleUrl: './overview-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPageComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modal = inject(ModalService);
  private projectsService = inject(ProjectsService);

  private _projects$ = new BehaviorSubject<ProjectDto[]>([]);
  projects$ = this._projects$.asObservable();

  ngOnInit() {
    this.loadProjects();
  }

  private loadProjects() {
    this.projectsService.apiProjectsGet().subscribe(projects => {
      console.log('Loaded projects:', projects);

      this._projects$.next(projects);
      if (!this.route.firstChild && projects.length > 0) {
        this.router.navigate(['project', projects[0].id], {
          relativeTo: this.route,
        });
      }
    });
  }

  onAddProject() {
    this.modal
      .openTextPrompt({
        title: 'New project',
        placeholder: 'Enter project name',
      })
      .pipe(take(1))
      .subscribe((value) => {
        const name = value?.trim();
        if (!name) return;

        const newProject: ProjectDto = { id: 0, name };
        this.projectsService.apiProjectsPost({ body: newProject }).subscribe(project => {
          this.loadProjects();
          this.router.navigate(['project', project.id], {
            relativeTo: this.route,
          });
        });
      });
  }

  onEditProject(project: ProjectDto) {
  this.modal.openTextPrompt({
    title: `Rename "${project.name}"`,
    placeholder: 'Enter new name',
    initialValue: project.name,
  })
  .pipe(take(1))
  .subscribe(nameRaw => {
    const name = nameRaw?.trim();
    if (!name) return;

    this.projectsService.apiProjectsIdGet({ id: project.id }).pipe(
      take(1),
      switchMap(full => this.projectsService.apiProjectsPost({ body: { ...full, name } }))
    ).subscribe(() => {
      this.loadProjects();
      this.router.navigate(['project', project.id], {
        relativeTo: this.route,
        queryParams: { refresh: Date.now() },
        queryParamsHandling: 'merge',
      });
    });
  });
} 

  onDeleteProject(project: ProjectDto) {
    this.modal
      .openConfirm({
        title: 'Delete project?',
        message: `This will permanently remove "${project.name}".`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        danger: true,
      })
      .pipe(first())
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.projectsService.apiProjectsIdDelete({ id: project.id }).subscribe(() => {
          this.loadProjects();
          const remaining = this._projects$.value;
          if (remaining.length > 0) {
            this.router.navigate(['project', remaining[0].id], {
              relativeTo: this.route,
            });
          } else {
            this.router.navigate(['./'], { relativeTo: this.route });
          }
        });
      });
  }

  onProjectSelected(project: ProjectDto) {
    this.router.navigate(['project', project.id], { relativeTo: this.route });
  }

  drop(event: CdkDragDrop<ProjectDto[]>) {
    const copy = [...this._projects$.value];
    const [moved] = copy.splice(event.previousIndex, 1);
    copy.splice(event.currentIndex, 0, moved);
    this._projects$.next(copy);
  }
}