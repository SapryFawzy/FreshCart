import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CategorsService } from '../../../../../core/services/categors.service';
import { Icatgory } from '../../../../../core/models/catgory/icatgory.interface';
import { IcatgoryRes } from '../../../../../core/models/catgoryRes/icatgory-res.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-catgories',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './catgories.component.html',
  styleUrl: './catgories.component.css',
})
export class CatgoriesComponent implements OnInit {
  private readonly categorsService = inject(CategorsService);
  categories: WritableSignal<Icatgory[]> = signal([]);

  ngOnInit(): void {
    this.getCategors();
  }

  getCategors() {
    this.categorsService.getAllCatgories().subscribe((res: IcatgoryRes) => {
      this.categories.set(res.data);
    });
  }
}
