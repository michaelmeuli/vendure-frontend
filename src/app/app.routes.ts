import { Route } from '@angular/router';

import { ProductDetailComponent } from './core/components/product-detail/product-detail.component';
import { ProductListComponent } from './core/components/product-list/product-list.component';
import { ImpressumComponent } from './shared/components/impressum/impressum.component';
import { PrivacyPolicyComponent } from './shared/components/privacypolicy/privacypolicy.component';

export const routes: Route[] = [
    {
        path: 'category/:slug',
        component: ProductListComponent,
        pathMatch: 'full',
    },
    {
        path: 'search',
        component: ProductListComponent,
    },
    {
        path: 'product/:slug',
        component: ProductDetailComponent,
    },
    {
        path: 'impressum',
        component: ImpressumComponent,
    },
    {
        path: 'privacypolicy',
        component: PrivacyPolicyComponent,
    },
    {
        path: 'account',
        loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
    },
    {
        path: 'checkout',
        loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutModule),
    },
];
