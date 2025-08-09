import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-worlds-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './worlds-view.component.html',
  styleUrl: './worlds-view.component.scss'
})
export class WorldsViewComponent {
  @Input({ required: true }) group!: FormGroup;
}
