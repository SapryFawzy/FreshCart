import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, inject, OnDestroy, PLATFORM_ID } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
})
export class ScrollReveal implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          this.el.nativeElement.classList.add('is-visible');
          this.observer?.unobserve(this.el.nativeElement);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
