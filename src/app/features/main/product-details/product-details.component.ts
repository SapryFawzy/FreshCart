import { TranslatePipe } from '@ngx-translate/core';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { Iproduct, Review, ReviewsStatus } from '../../../core/models/product/iproduct.interface';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TimeAgoFormatPipe } from '../../../shared/pipes/time-ago-format-pipe';
import { IproductRes } from '../../../core/models/product-res/iproduct-res.interface';
import { ProductCardComponent } from '../../../shared/ui/product/components/product-card/product-card.component';
import { UserService } from '../../../core/auth/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-product-details',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TimeAgoFormatPipe,
    ProductCardComponent,
    TranslatePipe,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit, AfterViewInit {
  private readonly productsService = inject(ProductsService);
  private readonly userService = inject(UserService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  productID: WritableSignal<string> = signal('');
  product: WritableSignal<Iproduct> = signal({} as Iproduct);
  stars = Array(5);
  quantity = new FormControl(1);
  totalePrice: WritableSignal<number> = signal(1);
  isMax: WritableSignal<boolean> = signal(false);
  isMin: WritableSignal<boolean> = signal(false);
  imageGallerySlides = viewChild<ElementRef<HTMLDivElement>>('imageGallerySlides');
  thumbnailNavigationBar = viewChild<ElementRef<HTMLDivElement>>('thumbnailNavigationBar');
  selectedImageIndex = signal(0);
  navAndTabsFlag: WritableSignal<number> = signal(1);
  reviewsStatus: WritableSignal<ReviewsStatus> = signal({} as ReviewsStatus);
  visibleCount: WritableSignal<number> = signal(1);
  products: WritableSignal<Iproduct[]> = signal([]);
  productsSlider = viewChild<ElementRef<HTMLDivElement>>('productsSlider');
  currentIndex = signal(0);
  adding: WritableSignal<boolean> = signal(false);
  done: WritableSignal<boolean> = signal(false);
  doneLoading: WritableSignal<boolean> = signal(false);
  currentUserId = signal<string | null>(null);
  isLoggedIn = signal(false);
  reviewFormOpen = signal(false);
  editingReviewId = signal<string | null>(null);
  savingReview = signal(false);
  deletingReviewId = signal<string | null>(null);
  reviewsLoading = signal(false);
  reviewForm = this.formBuilder.group({
    review: ['', [Validators.required, Validators.maxLength(1000)]],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
  });

  ngOnInit(): void {
    this.loadCurrentUser();
    this.getProductID();
    this.getProduct();
  }

  ngAfterViewInit(): void {
    this.thumbnailNavigationBar()?.nativeElement.children[0].classList.add('active');
  }

  checkQuantity() {
    if (this.quantity.value) {
      if (this.quantity.value >= this.product().quantity) {
        this.quantity.setValue(this.product().quantity);
        this.isMax.set(true);
        this.isMin.set(false);
      } else if (this.quantity.value < this.product().quantity) {
        this.isMax.set(false);
        this.isMin.set(false);
        if (this.quantity.value <= 1) {
          this.quantity.setValue(1);
          this.isMin.set(true);
        }
      }
    }
  }

  changeQuantity(num: number): void {
    if (this.quantity.value) {
      this.quantity.setValue(this.quantity.value + num);
    }
    this.setTotalePrice();
  }

  setTotalePrice(): void {
    this.checkQuantity();
    if (this.quantity.value) {
      this.totalePrice.set(this.product().price * this.quantity.value);
    }
  }

  getProductID(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.productID.set(id);
    }
  }

  getProduct(): void {
    this.productsService.getSpecificProduct(this.productID()).subscribe((res: any) => {
      this.product.set(res.data);
      this.updateReviewSummary(res.data.reviews ?? []);
      this.setTotalePrice();
      this.getAllProducts();
      this.loadWishlistState();
      setTimeout(() => {
        this.doneLoading.set(true);
      }, 500);
    });
  }

  moveSlider(btn: HTMLButtonElement): void {
    const btnNum = btn.getAttribute('tabindex') as string;
    const imageGallery = this.imageGallerySlides();
    const thumbnailBar = this.thumbnailNavigationBar();
    if (imageGallery) {
      const selectedSlide = imageGallery.nativeElement.children[+btnNum] as HTMLElement;
      imageGallery.nativeElement.style.translate = `-${selectedSlide.offsetLeft}px 0`;
    }

    if (thumbnailBar) {
      const bar = thumbnailBar.nativeElement;
      Array.from(bar.children).forEach((element) => {
        element.classList.remove('active');
      });
      const selectedThumbnail = bar.children[Number(btnNum)] as HTMLElement;
      selectedThumbnail.classList.add('active');
      const containerWidth = bar.parentElement!.clientWidth;
      const thumbnailCenter = selectedThumbnail.offsetLeft + selectedThumbnail.offsetWidth / 2;
      let targetTranslate = thumbnailCenter - containerWidth / 2;
      const maxTranslate = bar.scrollWidth - containerWidth;
      targetTranslate = Math.max(0, Math.min(targetTranslate, maxTranslate));
      bar.style.translate = `-${targetTranslate}px 0`;
    }
  }

  moveProductSlider(direction: 'next' | 'prev'): void {
    const slider = this.productsSlider()?.nativeElement;
    if (!slider) return;
    const slides = Array.from(slider.children) as HTMLElement[];
    if (!slides.length) return;
    const maxIndex = slides.length - 5;
    const nextIndex = direction === 'next' ? this.currentIndex() + 1 : this.currentIndex() - 1;
    if (nextIndex < 0 || nextIndex > maxIndex) return;
    this.currentIndex.set(nextIndex);
    const selectedSlide = slides[nextIndex];
    slider.style.translate = `-${selectedSlide.offsetLeft}px 0`;
  }

  changeNavAndTabsFlag(num: number): void {
    if (num === this.navAndTabsFlag()) return;
    this.navAndTabsFlag.set(num);
    if (num === 2) this.loadProductReviews();
  }

  showMoreReviews() {
    this.visibleCount.update((count) => count + 2);
  }

  private loadCurrentUser(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    this.isLoggedIn.set(!!token);
    let tokenUserId: string | undefined;
    if (token) {
      try {
        tokenUserId =
          jwtDecode<{ id?: string; _id?: string }>(token).id ??
          jwtDecode<{ _id?: string }>(token)._id;
      } catch {
        tokenUserId = undefined;
      }
    }
    try {
      const rawUser = localStorage.getItem('user') ?? sessionStorage.getItem('user');
      const user = rawUser ? (JSON.parse(rawUser) as { id?: string; _id?: string }) : {};
      this.currentUserId.set(user.id ?? user._id ?? tokenUserId ?? null);
    } catch {
      this.currentUserId.set(tokenUserId ?? null);
    }
  }

  ownsReview(review: Review): boolean {
    const userId = this.currentUserId();
    return !!userId && review.user?._id === userId;
  }

  getOwnReview(): Review | undefined {
    return this.product().reviews?.find((review) => this.ownsReview(review));
  }

  loadProductReviews(): void {
    const productId = this.product()._id;
    if (!productId) return;
    this.reviewsLoading.set(true);
    this.userService.getReviewsForProduct(productId).subscribe({
      next: (res: any) => {
        const reviews = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.reviews)
            ? res.data.reviews
            : [];
        this.updateProductReviews(reviews);
        this.reviewsLoading.set(false);
      },
      error: () => {
        this.reviewsLoading.set(false);
        this.toastr.error(this.translateReviewMessage('REVIEW_LOAD_FAILED'));
      },
    });
  }

  openReviewForm(review?: Review): void {
    if (!this.isLoggedIn()) return;
    this.editingReviewId.set(review && this.ownsReview(review) ? review._id : null);
    this.reviewForm.reset({ review: review?.review ?? '', rating: review?.rating ?? 5 });
    this.reviewFormOpen.set(true);
  }

  closeReviewForm(): void {
    if (this.savingReview()) return;
    this.reviewFormOpen.set(false);
    this.editingReviewId.set(null);
    this.reviewForm.reset({ review: '', rating: 5 });
  }

  submitReview(): void {
    if (!this.isLoggedIn() || this.reviewForm.invalid || this.savingReview()) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const payload = {
      review: (this.reviewForm.controls.review.value ?? '').trim(),
      rating: Number(this.reviewForm.controls.rating.value),
    };
    if (!payload.review) {
      this.reviewForm.controls.review.setErrors({ required: true });
      return;
    }

    const reviewId = this.editingReviewId();
    const currentReview = reviewId
      ? this.product().reviews?.find((review) => review._id === reviewId && this.ownsReview(review))
      : undefined;
    if (reviewId && !currentReview) return;

    this.savingReview.set(true);
    const request = reviewId
      ? this.userService.updateReviewForProduct(reviewId, payload)
      : this.userService.createReviewForProduct(this.product()._id, payload);
    request.subscribe({
      next: (res: any) => {
        const returned = this.extractReview(res);
        if (reviewId && currentReview) {
          const updated = {
            ...currentReview,
            ...returned,
            ...payload,
            user: currentReview.user,
          } as Review;
          this.replaceReview(reviewId, updated);
        } else {
          const created = (
            returned
              ? {
                  ...returned,
                  user: returned.user ?? {
                    _id: this.currentUserId() ?? '',
                    name: this.getCurrentUserName(),
                  },
                }
              : {
                  _id: res?.data?._id ?? res?._id ?? `local-${Date.now()}`,
                  product: this.product()._id,
                  user: { _id: this.currentUserId() ?? '', name: this.getCurrentUserName() },
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
          ) as Review;
          const reviews = this.product().reviews ?? [];
          this.updateProductReviews([
            ...reviews.filter((item) => !this.ownsReview(item)),
            { ...created, ...payload },
          ]);
        }
        this.loadProductReviews();
        this.reviewFormOpen.set(false);
        this.editingReviewId.set(null);
        this.reviewForm.reset({ review: '', rating: 5 });
        this.toastr.success(
          this.translateReviewMessage(reviewId ? 'REVIEW_UPDATED' : 'REVIEW_ADDED'),
        );
        this.savingReview.set(false);
      },
      error: () => {
        this.savingReview.set(false);
        this.toastr.error(this.translateReviewMessage('REVIEW_SAVE_FAILED'));
      },
    });
  }

  deleteReview(review: Review): void {
    if (!this.ownsReview(review) || this.deletingReviewId()) return;
    this.deletingReviewId.set(review._id);
    this.userService.deleteReviewForProduct(review._id).subscribe({
      next: (res: any) => {
        this.updateProductReviews(
          (this.product().reviews ?? []).filter((item) => item._id !== review._id),
        );
        this.loadProductReviews();
        this.toastr.success(this.translateReviewMessage('REVIEW_DELETED'));
        this.deletingReviewId.set(null);
      },
      error: () => {
        this.deletingReviewId.set(null);
        this.toastr.error(this.translateReviewMessage('REVIEW_DELETE_FAILED'));
      },
    });
  }

  private extractReview(res: any): Review | undefined {
    const data = res?.data;
    const candidate =
      data?.review ?? data?.reviews?.find?.((item: Review) => this.ownsReview(item)) ?? data;
    return candidate && typeof candidate.review === 'string' && candidate._id
      ? (candidate as Review)
      : undefined;
  }

  private replaceReview(id: string, review: Review): void {
    this.updateProductReviews(
      (this.product().reviews ?? []).map((item) => (item._id === id ? review : item)),
    );
  }

  private updateProductReviews(reviews: Review[]): void {
    this.product.update((product) => ({ ...product, reviews }));
    this.updateReviewSummary(reviews);
  }

  private updateReviewSummary(reviews: Review[]): void {
    const counts = [1, 2, 3, 4, 5].map(
      (rating) => reviews.filter((item) => item.rating === rating).length,
    );
    const denominator = reviews.length || 1;
    this.reviewsStatus.set({
      oneStar: Math.round((counts[0] / denominator) * 100),
      twoStar: Math.round((counts[1] / denominator) * 100),
      threeStar: Math.round((counts[2] / denominator) * 100),
      fourStar: Math.round((counts[3] / denominator) * 100),
      fiveStar: Math.round((counts[4] / denominator) * 100),
    });
    this.product.update((product) => ({
      ...product,
      ratingsQuantity: reviews.length,
      ratingsAverage: reviews.length
        ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1))
        : 0,
    }));
  }

  private getCurrentUserName(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    try {
      const rawUser = localStorage.getItem('user') ?? sessionStorage.getItem('user');
      return rawUser ? ((JSON.parse(rawUser) as { name?: string }).name ?? '') : '';
    } catch {
      return '';
    }
  }

  private translateReviewMessage(key: string): string {
    return this.translate.instant(`UI.${key}`);
  }

  getAllProducts(): void {
    this.productsService
      .getAllProducts('?category=' + this.product().category._id)
      .subscribe((res: IproductRes) => {
        this.products.set(res.data);
      });
  }

  loadWishlistState(): void {
    this.userService.loadWishlist();
  }

  isProductInWishList(): boolean {
    return this.userService.wishlistIds().has(this.product()._id);
  }

  addToWithList(productId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      let token = localStorage.getItem('token');
      if (!token) token = sessionStorage.getItem('token');
      if (token) {
        const exists = this.userService.wishlistIds().has(productId);
        const action = exists
          ? this.userService.removefromWithList(productId)
          : this.userService.addToWithList({ productId });
        action.subscribe((res: any) => {
          this.userService.setWishlistMembership(productId, !exists);
          this.toastr.success(res.message, 'Fresh Cart');
        });
      } else {
        this.toastr.warning('plz login frist!');
      }
    }
  }

  addToCart(id: string) {
    if (isPlatformBrowser(this.platformId)) {
      let token = localStorage.getItem('token');
      if (!token) token = sessionStorage.getItem('token');
      if (token) {
        this.adding.set(true);
        this.done.set(false);
        const payload = {
          productId: id,
        };
        this.userService.addToCart(payload).subscribe((res: any) => {
          this.toastr.success(res.message, 'Fresh Cart');
          this.userService.refreshCartCount();
          this.adding.set(false);
          this.done.set(true);
          setTimeout(() => {
            this.done.set(false);
          }, 1000);
        });
      } else {
        this.toastr.warning('plz login frist!');
      }
    }
  }

  goToCheckOut(): void {
    if (isPlatformBrowser(this.platformId)) {
      let token = localStorage.getItem('token');
      if (!token) token = sessionStorage.getItem('token');
      if (token) {
        this.router.navigate(['/checkout']);
      } else {
        this.toastr.warning('plz login frist!');
      }
    }
  }
}
