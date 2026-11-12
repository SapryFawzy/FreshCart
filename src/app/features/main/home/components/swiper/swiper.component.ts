import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { register } from 'swiper/element/bundle';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-swiper',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './swiper.component.html',
  styleUrl: './swiper.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SwiperComponent {
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  slides = signal([
    {
      title: 'UI.CAROUSEL_DECOR',
      content: 'UI.CAROUSEL_OFFER',
      buttonTextOne: 'UI.SHOP_NOW',
      buttonTextTwo: 'UI.VIEW_DEALS',
      image: '/images/1.jfif',
    },
    {
      title: 'UI.CAROUSEL_COTTON',
      content: 'UI.CAROUSEL_OFFER',
      buttonTextOne: 'UI.SHOP_NOW',
      buttonTextTwo: 'UI.VIEW_DEALS',
      image: '/images/2.jfif',
    },
    {
      title: 'UI.CAROUSEL_FRESH_DELIVERY',
      content: 'UI.CAROUSEL_OFFER',
      buttonTextOne: 'UI.SHOP_NOW',
      buttonTextTwo: 'UI.VIEW_DEALS',
      image: '/images/3.jfif',
    },
    {
      title: 'UI.CAROUSEL_PREMIUM',
      content: 'UI.FRESH_NATURE_TABLE',
      buttonTextOne: 'UI.SHOP_NOW',
      buttonTextTwo: 'UI.VIEW_DEALS',
      image: '/images/4.jfif',
    },
    {
      title: 'UI.CAROUSEL_FRESH_DELIVERY',
      content: 'UI.FRESH_FARM_TABLE',
      buttonTextOne: 'UI.SHOP_NOW',
      buttonTextTwo: 'UI.VIEW_DEALS',
      image: '/images/5.jfif',
    },
  ]);
  swiper = viewChild<ElementRef<HTMLElement>>('swiper');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      register();

      const swiperEl = this.swiper()?.nativeElement as any;

      if (!swiperEl) return;

      Object.assign(swiperEl, {
        init: false,
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
        navigation: true,
        pagination: {
          clickable: true,
        },
      });

      swiperEl.initialize();

      this.translate.onLangChange.pipe(takeUntilDestroyed(destroyRef)).subscribe(({ lang }) => {
        const direction = lang === 'ar' ? 'rtl' : 'ltr';
        const swiperInstance = swiperEl.swiper;

        if (!swiperInstance) return;

        const currentIndex = swiperInstance.realIndex;

        swiperEl.setAttribute('dir', direction);

        swiperInstance.changeLanguageDirection(direction);

        requestAnimationFrame(() => {
          swiperInstance.updateSize();
          swiperInstance.updateSlides();
          swiperInstance.updateProgress();
          swiperInstance.updateSlidesClasses();

          swiperInstance.slideToLoop(currentIndex, 0, false);

          swiperInstance.update();
        });
      });
    });
  }
}
