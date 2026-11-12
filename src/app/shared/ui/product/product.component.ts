import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ProductsService } from '../../../core/services/products.service';
import { Iproduct } from '../../../core/models/product/iproduct.interface';
import { IproductRes } from '../../../core/models/product-res/iproduct-res.interface';
import { ProductCardComponent } from './components/product-card/product-card.component';

@Component({
  selector: 'app-product',
  imports: [ProductCardComponent, TranslatePipe],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  products: WritableSignal<Iproduct[]> = signal([]);
  done: WritableSignal<boolean> = signal(false);
  ngOnInit(): void {
    this.getAllProducts();
  }

  getAllProducts() {
    this.productsService.getAllProducts().subscribe((res: IproductRes) => {
      this.products.set(res.data);
      setTimeout(() => {
        this.done.set(true);
      }, 500);
    });
  }
}
