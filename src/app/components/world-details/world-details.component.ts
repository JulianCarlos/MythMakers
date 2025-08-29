import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WorldDto } from '@api/models';
import { Store } from '@ngrx/store';

import * as fromActions from 'store/actions/project.action';
import * as fromSelectors from 'store/selectors/project.selector';

@Component({
  selector: 'app-world-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './world-details.component.html',
  styleUrl: './world-details.component.scss',
})
export class WorldDetailsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  @Input() projectId!: number;
  @Input() worldId!: number;

  protected selectedWorld?: WorldDto | null;

  protected form: FormGroup = this.fb.group({ 
    shortDescription: [''],
    longDescription: ['']  
  });

  ngOnInit(): void {
    this.store.select(fromSelectors.getSelectedWorld(this.worldId)).subscribe(world => {
      this.selectedWorld = world;
    });

    this.form.patchValue({
      shortDescription: this.selectedWorld?.shortDescription ?? '',
      longDescription: this.selectedWorld?.longDescription ?? ''
    });

    this.form.valueChanges.subscribe(value => {
      console.log(value);
    });
  }
}
