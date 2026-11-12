import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'categories/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'subcategories/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'products/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
