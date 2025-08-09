import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Project } from '../../models/project';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WorldsViewComponent } from "../worlds-view/worlds-view.component";

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [WorldsViewComponent],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss'
})
export class ProjectDetailsComponent implements OnInit {
  @Input() set selectedProject(value: Project | undefined) {
    this.SetFormData(value);
  }

  get selectedProject() { return this._selectedProject; }
  
  private _selectedProject?: Project;

  @Output() onSave = new EventEmitter<Project>();

  protected form!: FormGroup;

  protected get worlds (): FormGroup {
    return this.form.get('worlds') as FormGroup; 
  }

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    
  }

  initForm(): void {
    this.form = this.fb.group({
      worlds: this.fb.group({
        name: this.fb.control(null),
        description: this.fb.control(null),
      }),
    });
  }

  save(): void {
    if (!this.selectedProject) return;

    this.onSave.emit({
      ...this.selectedProject,
      worlds: this.form.value.worlds
    });
  }

  private SetFormData(value: Project | undefined) {
    if (!this.form)
      return;

    this.form.reset();

    this._selectedProject = value;

    if (this.form && value) {
      this.form.patchValue({ worlds: value.worlds ?? null });
    }
  }
}
