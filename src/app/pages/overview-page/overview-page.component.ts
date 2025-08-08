import { Component } from '@angular/core';
import { ProjectOverviewListItemComponent } from "../../components/project-overview-list-item/project-overview-list-item.component";

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [ProjectOverviewListItemComponent],
  templateUrl: './overview-page.component.html',
  styleUrl: './overview-page.component.scss'
})
export class OverviewPageComponent {

}
