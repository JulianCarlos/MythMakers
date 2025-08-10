import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Project } from '../../models/project';
import { City } from '../../models/city';
import { ModalService } from '../../core/modal/modal.service';
import { ViewListComponent } from '../../core/view-list/view-list.component';

@Component({
  selector: 'app-cities-view',
  standalone: true,
  imports: [CommonModule, ViewListComponent],
  templateUrl: './cities-view.component.html',
  styleUrls: ['./cities-view.component.scss']
})
export class CitiesViewComponent {
  private modal = inject(ModalService);

  @Input() project?: Project;

  @Output() openCity = new EventEmitter<string>();
  @Output() addCityName = new EventEmitter<string>();
  @Output() removeCityId = new EventEmitter<string>();

  get cities(): readonly City[] {
    return this.project?.cities ?? [];
  }

  idOf = (c: City) => c.id;
  labelOf = (c: City) => c.name ?? '';
  onSelectCity = (id: string) => this.openCity.emit(id);
  onRemoveCity = (id: string) => this.removeCityId.emit(id);
  onAddCity = () => {
    this.modal.openTextPrompt({ title: 'New city', placeholder: 'Enter city name' })
      .subscribe(value => {
        const trimmed = value?.trim();
        if (trimmed) this.addCityName.emit(trimmed);
      });
  };
}
