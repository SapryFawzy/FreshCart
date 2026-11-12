import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IproductRes } from '../models/product-res/iproduct-res.interface';
import { IbrandRes } from '../models/brand-res/ibrand-res.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly httpClint = inject(HttpClient);

  getAllProducts(param: string = ''): Observable<IproductRes> {
    return this.httpClint.get<IproductRes>(environment.basUrlV1 + `/products${param}`);
  }

  getSpecificProduct(id: string): Observable<IproductRes> {
    return this.httpClint.get<IproductRes>(environment.basUrlV1 + `/products/${id}`);
  }

  getAllBrands(id: string = ''): Observable<IbrandRes> {
    return this.httpClint.get<IbrandRes>(environment.basUrlV1 + `/brands/${id}`);
  }
}
