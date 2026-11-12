import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  PLATFORM_ID,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { Icatgory } from '../../core/models/catgory/icatgory.interface';
import { CategorsService } from '../../core/services/categors.service';
import { IcatgoryRes } from '../../core/models/catgoryRes/icatgory-res.interface';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { Iuser } from '../../core/models/user/iuser.interface';
import { filter } from 'rxjs';
import { UserService } from '../../core/auth/services/user.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule,
    RouterLink,
    MenuModule,
    MenubarModule,
    RouterLinkActive,
    TranslatePipe,
    ReactiveFormsModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  categriesItems: MenuItem[] = [];
  profileItems: MenuItem[] = [];
  showCategoriesMenu: WritableSignal<boolean> = signal(false);
  isLogedInUser: WritableSignal<boolean> = signal(false);
  isMenuOpen: WritableSignal<boolean> = signal(false);
  navMenu = viewChild<ElementRef<HTMLDivElement>>('navMenu');
  menuBtn = viewChild<ElementRef<HTMLDivElement>>('menuBtn');
  private readonly categorsService = inject(CategorsService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly platform_id = inject(PLATFORM_ID);
  readonly translation = inject(TranslationService);
  private readonly translate = inject(TranslateService);
  categories: WritableSignal<Icatgory[]> = signal([]);
  user: WritableSignal<Iuser | null> = signal(null);
  wishListCount: Signal<number> | WritableSignal<number> = computed(() =>
    this.userService.wishListCount(),
  );
  cartCount: Signal<number> | WritableSignal<number> = computed(() => this.userService.cartCount());
  searchForm = this.fb.group({
    search: ['', Validators.required],
  });

  ngOnInit(): void {
    this.initNav();
    this.translate.onLangChange.subscribe(() => this.initNav());
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (isPlatformBrowser(this.platform_id)) {
        let token = localStorage.getItem('token');
        if (!token) token = sessionStorage.getItem('token');
        if (token) {
          this.getWishlistAndCartCount();
        } else {
          this.userService.wishListCount.set(0);
          this.userService.cartCount.set(0);
        }
      }
    });
  }

  getWishlistAndCartCount() {
    if (isPlatformBrowser(this.platform_id)) {
      let user = JSON.parse(localStorage.getItem('user')!);
      if (!user) user = JSON.parse(sessionStorage.getItem('user')!);
      if (user) {
        this.getWishListCount();
        this.getCartCount();
        this.user.set(user);
        this.isLogedInUser.set(true);
      }
    }
  }

  initNav(): void {
    this.getWishlistAndCartCount();
    this.categorsService.getAllCatgories().subscribe((res: IcatgoryRes) => {
      this.categories.set(res.data ?? []);
      this.categriesItems = [
        {
          items: [
            {
              label: this.translate.instant('UI.ALL_CATEGORIES'),
              command: () => {
                if (this.isMenuOpen()) {
                  this.isMenuOpen.set(false);
                }
              },
              routerLink: '/categories',
            },
            {
              label: this.translate.instant('UI.ELECTRONICS'),
              command: () => {
                if (this.isMenuOpen()) {
                  this.isMenuOpen.set(false);
                }
                this.router.navigate(['/shop'], {
                  queryParams: {
                    category: this.categoryID('Electronics'),
                  },
                });
              },
            },
            {
              label: this.translate.instant('UI.WOMENS_FASHION'),
              command: () => {
                if (this.isMenuOpen()) {
                  this.isMenuOpen.set(false);
                }
                this.router.navigate(['/shop'], {
                  queryParams: {
                    category: this.categoryID("Women's Fashion"),
                  },
                });
              },
            },
            {
              label: this.translate.instant('UI.MENS_FASHION'),
              command: () => {
                if (this.isMenuOpen()) {
                  this.isMenuOpen.set(false);
                }
                this.router.navigate(['/shop'], {
                  queryParams: {
                    category: this.categoryID("Men's Fashion"),
                  },
                });
              },
            },
            {
              label: this.translate.instant('UI.BEAUTY_HEALTH'),
              command: () => {
                if (this.isMenuOpen()) {
                  this.isMenuOpen.set(false);
                }
                this.router.navigate(['/shop'], {
                  queryParams: {
                    category: this.categoryID('Beauty & Health'),
                  },
                });
              },
            },
          ],
        },
      ];
    });
    let profileItems;
    let profileOptionsIfLogedIn: MenuItem[] = [];
    let labelIfLogedIn;
    if (this.isLogedInUser()) {
      labelIfLogedIn = `${this.user()?.name}`;
      profileItems = [
        { separator: true },
        {
          label: this.translate.instant('UI.PROFILE'),
          command: () => {
            if (this.isMenuOpen()) {
              this.isMenuOpen.set(false);
            }
            this.router.navigate(['/profile/addresses']);
          },
        },
        {
          label: this.translate.instant('UI.MY_ORDERS'),
          command: () => {
            if (this.isMenuOpen()) {
              this.isMenuOpen.set(false);
            }
            this.router.navigate(['/orders']);
          },
        },
        {
          label: this.translate.instant('UI.MY_WISHLIST'),
          command: () => {
            if (this.isMenuOpen()) {
              this.isMenuOpen.set(false);
            }
            this.router.navigate(['/wishlist']);
          },
        },
        {
          label: this.translate.instant('UI.ADDRESSES'),
          command: () => {
            if (this.isMenuOpen()) {
              this.isMenuOpen.set(false);
            }
            this.router.navigate(['/profile/addresses']);
          },
        },
        {
          label: this.translate.instant('UI.SETTINGS'),
          command: () => {
            if (this.isMenuOpen()) {
              this.isMenuOpen.set(false);
            }
            this.router.navigate(['/profile/settings']);
          },
        },
      ];
      profileOptionsIfLogedIn = [
        { separator: true },
        {
          items: [
            {
              label: this.translate.instant('UI.SIGN_OUT'),
              styleClass: 'sign-out-item',
              command: () => this.signOut(),
            },
          ],
        },
      ];
    } else {
      profileItems = [
        {
          label: this.translate.instant('UI.SIGN_IN'),
          routerLink: '/login',
          command: () => {
            if (this.isMenuOpen()) {
              this.isMenuOpen.set(false);
            }
          },
        },
        {
          label: this.translate.instant('UI.SIGN_UP'),
          routerLink: '/signup',
          command: () => {
            if (this.isMenuOpen()) {
              this.isMenuOpen.set(false);
            }
          },
        },
      ];
    }
    this.profileItems = [
      {
        label: labelIfLogedIn,
        items: [...profileItems],
      },
      ...profileOptionsIfLogedIn,
    ];
  }

  toggleLanguage(): void {
    const nextLanguage = this.translation.getCurrentLanguage() === 'en' ? 'ar' : 'en';
    this.translation.changeLanguage(nextLanguage);
  }

  @HostListener('document:click', ['$event']) hideMenu(event: MouseEvent) {
    const target = event.target as Node;
    if (target) {
      if (this.menuBtn()?.nativeElement.contains(target)) {
        this.isMenuOpen.set(true);
      } else if (!this.navMenu()?.nativeElement.contains(target)) {
        this.isMenuOpen.set(false);
      }
    }
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.user.set(null);
    this.isLogedInUser.set(false);
    this.initNav();
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.isMenuOpen.update((state) => !state);
  }

  categoryID(name: string): string {
    return this.categories().find((e) => e.name === name)?._id ?? '';
  }

  getWishListCount(): void {
    this.userService.refreshWishListCount();
  }

  getCartCount(): void {
    this.userService.refreshCartCount();
  }

  search(): void {
    if (this.searchForm.valid) {
      this.router.navigate([`/search`], {
        queryParams: {
          q: this.searchForm.get('search')?.value,
        },
      });
    }
  }
}
