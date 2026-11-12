import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Icatgory } from '../../../core/models/catgory/icatgory.interface';
import { CategorsService } from '../../../core/services/categors.service';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { IcatgoryRes } from '../../../core/models/catgoryRes/icatgory-res.interface';
import { Subcategory } from '../../../core/models/product/iproduct.interface';
import { Location } from '@angular/common';

type CategoryView = 'categories' | 'specific' | 'all-subcategories';

@Component({
  selector: 'app-catgories',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './catgories.component.html',
  styleUrl: './catgories.component.css',
})
export class CatgoriesComponent implements OnInit {
  private readonly categorsService = inject(CategorsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  CategoryID: WritableSignal<string | null> = signal(null);
  categories: WritableSignal<Icatgory[]> = signal([]);
  done: WritableSignal<boolean> = signal(false);
  allSubCategories: WritableSignal<Subcategory[]> = signal([]);
  subCategories: WritableSignal<Subcategory | null> = signal(null);
  viewMode: WritableSignal<CategoryView> = signal('categories');

  ngOnInit(): void {
    this.getCategoryID();
    this.getCategores();
  }

  goBack(): void {
    this.location.back();
  }

  getCategoryID(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.CategoryID.set(id);
  }

  getCategores(): void {
    this.done.set(false);
    if (this.CategoryID()) {
      this.viewMode.set('specific');
      if (this.router.url.includes('subcategories')) {
        this.categorsService.getSpecificSubCatgories(this.CategoryID()!).subscribe((res: any) => {
          this.subCategories.set(res.data);
        });
      } else {
        this.categorsService.getSpecificCatgories(this.CategoryID()!).subscribe((res: any) => {
          this.subCategories.set(res.data);
        });
      }
    } else {
      this.viewMode.set('categories');
      this.categorsService.getAllCatgories().subscribe((res: IcatgoryRes) => {
        this.categories.set(res.data);
      });
    }
    setTimeout(() => {
      this.done.set(true);
    }, 500);
  }

  getAllSubCategorys(): void {
    this.done.set(false);
    this.viewMode.set('all-subcategories');
    this.subCategories.set(null);
    this.categorsService.getAllSubCatgories().subscribe((res: any) => {
      this.allSubCategories.set(res.data);
      setTimeout(() => {
        this.done.set(true);
      }, 500);
    });
  }

  navigate(id: string): void {
    if (this.router.url.includes('subcategory')) {
      this.router.navigate(['/shop'], {
        queryParams: {
          subcategory: id,
        },
      });
    } else {
      this.router.navigate(['/shop'], {
        queryParams: {
          category: id,
        },
      });
    }
  }
}
