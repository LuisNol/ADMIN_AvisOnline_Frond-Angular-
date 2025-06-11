import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './products.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { LitsProductsComponent } from './lits-products/lits-products.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { CreateVariationSpecificationsComponent } from './attributes/create-variation-specifications/create-variation-specifications.component';
import { PermissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: ProductsComponent,
    children: [
      {
        path: 'register',
        component: CreateProductComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'manage-own-products' }
      },
      {
        path: 'list',
        component: LitsProductsComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'manage-own-products' }
      },
      {
        path: 'list/edit/:id',
        component: EditProductComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'manage-own-products' }
      },
      {
        path: 'list/variations-specifications/:id',
        component: CreateVariationSpecificationsComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'manage-own-products' }
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
