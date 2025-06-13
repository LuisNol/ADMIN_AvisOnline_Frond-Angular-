import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ProductLimitService } from 'src/app/modules/products/service/product-limit.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProductLimitGuard  {
  constructor(private productLimit: ProductLimitService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.productLimit.canCreateProduct().pipe(
      map(canCreate => {
        if (canCreate) {
          return true;
        }
        return this.router.parseUrl('/products/list');
      })
    );
  }
}
