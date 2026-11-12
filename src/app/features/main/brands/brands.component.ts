import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { Ibrand } from '../../../core/models/brand/ibrand.interface';
import { IbrandRes } from '../../../core/models/brand-res/ibrand-res.interface';

@Component({
  selector: 'app-brands',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css',
})
export class BrandsComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  brands: WritableSignal<Ibrand[]> = signal([]);
  done: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    this.getAllBrands();
  }

  getAllBrands() {
    this.productsService.getAllBrands().subscribe((res: IbrandRes) => {
      this.brands.set(res.data);
      setTimeout(() => {
        this.done.set(true);
      }, 500);
    });
  }
}
