import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PermissionService } from 'src/app/modules/auth/services/permission.service';
import { ProductService } from './product.service';

@Injectable({ providedIn: 'root' })
export class ProductLimitService {
  constructor(
    private permissionService: PermissionService,
    private productService: ProductService
  ) {}

  canCreateProduct(): Observable<boolean> {
    // Si es admin siempre puede crear
    if (this.permissionService.hasRole('Admin')) {
      return of(true);
    }

    return this.productService.countMyProducts().pipe(
      map(resp => resp.count < 3),
      catchError(() => of(true))
    );
  }

    return this.productService.countMyProducts().pipe(
      map(resp => 3 - resp.count),
      catchError(() => of(3))
    );
  }

}
