import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IcatgoryRes, IspecificCatgoryRes } from '../models/catgoryRes/icatgory-res.interface';

@Injectable({
  providedIn: 'root',
})
export class CategorsService {
  private readonly httpClint = inject(HttpClient);

  getAllCatgories(): Observable<IcatgoryRes> {
    return this.httpClint.get<IcatgoryRes>(`${environment.basUrlV1}/categories`);
  }

  getSpecificCatgories(id: string): Observable<IspecificCatgoryRes> {
    return this.httpClint.get<IspecificCatgoryRes>(`${environment.basUrlV1}/categories/${id}`);
  }

  getAllSubCatgories(): Observable<IcatgoryRes> {
    return this.httpClint.get<IcatgoryRes>(`${environment.basUrlV1}/subcategories`);
  }

  getSpecificSubCatgories(id: string): Observable<IspecificCatgoryRes> {
    return this.httpClint.get<IspecificCatgoryRes>(`${environment.basUrlV1}/subcategories/${id}`);
  }

  getAllSubCategoriesOnCategory(id: string): Observable<IspecificCatgoryRes> {
    return this.httpClint.get<IspecificCatgoryRes>(
      `${environment.basUrlV1}/categories/${id}/subcategories`,
    );
  }
}
