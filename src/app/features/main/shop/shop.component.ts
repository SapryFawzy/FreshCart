import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ProductCardComponent } from '../../../shared/ui/product/components/product-card/product-card.component';
import { IproductRes } from '../../../core/models/product-res/iproduct-res.interface';
import { Iproduct } from '../../../core/models/product/iproduct.interface';
import { ProductsService } from '../../../core/services/products.service';
import { Icatgory } from '../../../core/models/catgory/icatgory.interface';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { CategorsService } from '../../../core/services/categors.service';
import { IspecificCatgoryRes } from '../../../core/models/catgoryRes/icatgory-res.interface';
import { tap } from 'rxjs';
import { IbrandRes } from '../../../core/models/brand-res/ibrand-res.interface';
import { Ibrand } from '../../../core/models/brand/ibrand.interface';

@Component({
  selector: 'app-shop',
  imports: [ProductCardComponent, RouterLink, TranslatePipe],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css',
})
export class ShopComponent {
  private readonly productsService = inject(ProductsService);
  private readonly categorsService = inject(CategorsService);
  private readonly router = inject(ActivatedRoute);
  done: WritableSignal<boolean> = signal(false);
  products: WritableSignal<Iproduct[]> = signal([]);
  catgory: WritableSignal<Icatgory | null> = signal(null);
  brand: WritableSignal<Ibrand | null> = signal(null);
  subcategory: WritableSignal<Icatgory | null> = signal(null);
  categoryID: WritableSignal<string | null> = signal(null);
  brandID: WritableSignal<string | null> = signal(null);
  subcategoryID: WritableSignal<string | null> = signal(null);

  ngOnInit(): void {
    this.getCategoryId();
  }

  getCategoryId() {
    this.router.queryParamMap
      .pipe(
        tap((id: ParamMap) => {
          this.categoryID.set(id.get('category') ?? '');
          this.brandID.set(id.get('brand') ?? '');
          this.subcategoryID.set(id.get('subcategory') ?? '');
          this.getAllProducts();
          if (this.categoryID()) {
            this.getCatgory();
          } else if (this.brandID()) {
            this.getBrand();
          } else if (this.subcategoryID()) {
            this.getsubcategory();
          } else {
            this.catgory.set(null);
            this.brand.set(null);
          }
        }),
      )
      .subscribe();
  }

  getCatgory(): void {
    this.categorsService
      .getSpecificCatgories(this.categoryID() as string)
      .subscribe((res: IspecificCatgoryRes) => this.catgory.set(res.data));
  }

  getBrand(): void {
    this.productsService.getAllBrands(this.brandID() as string).subscribe((res: IbrandRes) => {
      this.brand.set(res.data as any);
    });
  }

  getsubcategory(): void {
    this.categorsService.getSpecificSubCatgories(this.subcategoryID()!).subscribe((res: any) => {
      this.subcategory.set(res.data);
    });
  }

  getAllProducts(): void {
    let param;
    let endpoint;
    if (this.categoryID()) {
      param = '?category=' + this.categoryID();
    }

    if (this.brandID()) {
      param = '?brand=' + this.brandID();
    }

    if (this.subcategoryID()) {
      param = '?subcategory=' + this.subcategoryID();
    }

    this.productsService.getAllProducts(param).subscribe((res: IproductRes) => {
      this.products.set(res.data);
      setTimeout(() => {
        this.done.set(true);
      }, 500);
    });
  }

  clearFilter(): void {
    this.categoryID.set(null);
    this.brandID.set(null);
    this.catgory.set(null);
    this.brand.set(null);
    this.getAllProducts();
  }
}
