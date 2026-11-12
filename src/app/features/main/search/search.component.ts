import { Component, DestroyRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Iproduct } from '../../../core/models/product/iproduct.interface';
import { Icatgory } from '../../../core/models/catgory/icatgory.interface';
import { Ibrand } from '../../../core/models/brand/ibrand.interface';
import { CategorsService } from '../../../core/services/categors.service';
import { ProductsService } from '../../../core/services/products.service';
import { IbrandRes } from '../../../core/models/brand-res/ibrand-res.interface';
import { ProductCardComponent } from '../../../shared/ui/product/components/product-card/product-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [ProductCardComponent, TranslatePipe, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategorsService);

  readonly products = signal<Iproduct[]>([]);
  readonly categories = signal<Icatgory[]>([]);
  readonly subcategories = signal<Icatgory[]>([]);
  readonly brands = signal<Ibrand[]>([]);
  readonly selectedCategories = signal<string[]>([]);
  readonly selectedSubcategories = signal<string[]>([]);
  readonly selectedBrands = signal<string[]>([]);
  readonly query = signal('');
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly sort = signal('');
  readonly loading = signal(false);
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly error = signal('');
  readonly resultCount = computed(() => this.products().length);
  private searchTimer?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  constructor() {
    this.categoriesService
      .getAllCatgories()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (res) => this.categories.set(res.data ?? []),
      });
    this.categoriesService
      .getAllSubCatgories()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (res) => this.subcategories.set(res.data ?? []),
      });
    this.productsService
      .getAllBrands()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (res: IbrandRes) => this.brands.set(res.data ?? []),
      });

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.query.set(params.get('q') ?? '');
      this.selectedCategories.set(params.getAll('category'));
      this.selectedSubcategories.set(params.getAll('subcategory'));
      this.selectedBrands.set(params.getAll('brand'));
      this.minPrice.set(this.readPrice(params.get('minPrice')));
      this.maxPrice.set(this.readPrice(params.get('maxPrice')));
      this.sort.set(params.get('sort') ?? '');
      this.fetchProducts(params);
    });
  }

  private readPrice(value: string | null): number | null {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private fetchProducts(params: import('@angular/router').ParamMap): void {
    const query = new URLSearchParams();
    for (const key of ['q', 'brand', 'category', 'subcategory', 'minPrice', 'maxPrice', 'sort']) {
      for (const value of params.getAll(key)) if (value) query.append(key, value);
    }
    this.loading.set(true);
    this.error.set('');
    this.productsService
      .getAllProducts(`?${query.toString()}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.products.set(res.data ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.products.set([]);
          this.error.set('Could not load products. Please try again.');
          this.loading.set(false);
        },
      });
  }

  toggleFilter(key: 'category' | 'subcategory' | 'brand', id: string, checked: boolean): void {
    const current =
      key === 'category'
        ? this.selectedCategories()
        : key === 'brand'
          ? this.selectedBrands()
          : this.selectedSubcategories();
    const next = checked ? [...new Set([...current, id])] : current.filter((item) => item !== id);
    if (key === 'category') this.selectedCategories.set(next);
    else if (key === 'brand') this.selectedBrands.set(next);
    else this.selectedSubcategories.set(next);
    this.updateUrl({ [key]: next.length ? next : null });
  }

  setPrice(key: 'minPrice' | 'maxPrice', value: string): void {
    const parsed = value.trim() ? Number(value) : null;
    if (parsed !== null && !Number.isFinite(parsed)) return;
    if (key === 'minPrice') this.minPrice.set(parsed);
    else this.maxPrice.set(parsed);
    this.updateUrl({ [key]: parsed });
  }

  setPriceRange(min: number | null, max: number | null): void {
    this.minPrice.set(min);
    this.maxPrice.set(max);
    this.updateUrl({ minPrice: min, maxPrice: max });
  }

  setSort(value: string): void {
    this.sort.set(value);
    this.updateUrl({ sort: value || null });
  }

  updateSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.updateUrl({ q: this.query().trim() || null });
    }, 500);
  }

  clearFilters(): void {
    this.selectedCategories.set([]);
    this.selectedSubcategories.set([]);
    this.selectedBrands.set([]);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sort.set('');
    this.updateUrl({
      category: null,
      subcategory: null,
      brand: null,
      minPrice: null,
      maxPrice: null,
      sort: null,
    });
  }

  private updateUrl(changes: Record<string, string | number | string[] | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: changes,
      queryParamsHandling: 'merge',
    });
  }
}
