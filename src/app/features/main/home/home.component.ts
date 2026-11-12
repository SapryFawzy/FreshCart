import { TranslatePipe } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { SwiperComponent } from './components/swiper/swiper.component';
import { FeaturesComponent } from './components/features/features.component';
import { CatgoriesComponent } from './components/catgories/catgories.component';
import { ProductComponent } from '../../../shared/ui/product/product.component';

@Component({
  selector: 'app-home',
  imports: [
    NewsletterComponent,
    SwiperComponent,
    FeaturesComponent,
    CatgoriesComponent,
    ProductComponent, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
