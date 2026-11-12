import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadComponent: () => import('./features/main/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/main/catgories/catgories.component').then((c) => c.CatgoriesComponent),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/main/search/search.component').then((c) => c.SearchComponent),
  },
  {
    path: 'subcategories/:id',
    loadComponent: () =>
      import('./features/main/catgories/catgories.component').then((c) => c.CatgoriesComponent),
  },
  {
    path: 'categories/:id',
    loadComponent: () =>
      import('./features/main/catgories/catgories.component').then((c) => c.CatgoriesComponent),
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/main/shop/shop.component').then((c) => c.ShopComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/main/product-details/product-details.component').then(
        (c) => c.ProductDetailsComponent,
      ),
  },
  {
    path: 'brands',
    loadComponent: () =>
      import('./features/main/brands/brands.component').then((c) => c.BrandsComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/main/contact-us/contact-us.component').then((c) => c.ContactUsComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/signin/signin.component').then((c) => c.SigninComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then((c) => c.SignupComponent),
  },
  {
    path: 'forget-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (c) => c.ForgotPasswordComponent,
      ),
  },
  {
    canActivate: [authGuard],
    path: 'wishlist',
    loadComponent: () =>
      import('./features/main/wishlist/wishlist.component').then((c) => c.WishlistComponent),
  },
  {
    canActivate: [authGuard],
    path: 'cart',
    loadComponent: () => import('./features/main/cart/cart.component').then((c) => c.CartComponent),
  },
  {
    path: 'profile',
    redirectTo: 'profile/addresses',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/profile/profile.component').then((c) => c.ProfileComponent),
    children: [
      {
        path: 'addresses',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/auth/profile/components/addresses/addresses.component').then(
            (c) => c.AddressesComponent,
          ),
      },
      {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/auth/profile/components/settings/settings.component').then(
            (c) => c.SettingsComponent,
          ),
      },
    ],
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/main/orders/orders.component').then((c) => c.OrdersComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/payment-gate-way/payment-gate-way.component').then(
        (c) => c.PaymentGateWayComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/Errors/notfound/notfound.component').then((c) => c.NotfoundComponent),
  },
];
