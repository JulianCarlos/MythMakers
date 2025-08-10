import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';   // ✅ use MatIconModule
import { Project } from '../../models/project';
import { City } from '../../models/city';
import { ModalService } from '../../core/modal/modal.service';

@Component({
  selector: 'app-cities-view',
  standalone: true,
  imports: [CommonModule, MatIconModule],                  // ✅ fix imports
  templateUrl: './cities-view.component.html',
  styleUrl: './cities-view.component.scss'
})
export class CitiesViewComponent {
  @Input() project?: Project;

  @Output() openCity = new EventEmitter<string>();
  @Output() addCityName = new EventEmitter<string>();

  get cities(): City[] {
    return this.project?.cities ?? [];
  }

  constructor(private modal: ModalService) {}

  onClickCity(city: City) {
    this.openCity.emit(city.id);
  }

  onAddCityItem(): void {
    if (!this.project) return;
    
    this.modal.openTextPrompt({ title: 'New city', placeholder: 'Enter city name' })
      .subscribe(value => {
        const trimmed = value?.trim();
        if (!trimmed) return;
        this.addCityName.emit(trimmed);
      });
  }
}
