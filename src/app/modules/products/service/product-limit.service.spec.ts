import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductLimitService } from './product-limit.service';
import { PermissionService } from 'src/app/modules/auth/services/permission.service';
import { ProductService } from './product.service';

class PermissionStub {
  admin = false;
  hasRole(role: string) { return role === 'Admin' && this.admin; }
}

class ProductStub {
  response = { count: 0 };
  countMyProducts() { return of(this.response); }
}

describe('ProductLimitService', () => {
  let service: ProductLimitService;
  let permission: PermissionStub;
  let product: ProductStub;

  beforeEach(() => {
    permission = new PermissionStub();
    product = new ProductStub();
    TestBed.configureTestingModule({
      providers: [
        ProductLimitService,
        { provide: PermissionService, useValue: permission },
        { provide: ProductService, useValue: product }
      ]
    });
    service = TestBed.inject(ProductLimitService);
  });

  it('should allow admin always', (done) => {
    permission.admin = true;
    service.canCreateProduct().subscribe(val => {
      expect(val).toBeTrue();
      done();
    });
  });

  it('should allow when user has less than 3 products', (done) => {
    product.response = { count: 2 };
    service.canCreateProduct().subscribe(val => {
      expect(val).toBeTrue();
      done();
    });
  });

  it('should block when user has 3 or more products', (done) => {
    product.response = { count: 3 };
    service.canCreateProduct().subscribe(val => {
      expect(val).toBeFalse();
      done();
    });
  });


  it('should return remaining attempts for client', (done) => {
    product.response = { count: 1 };
    service.getRemainingAttempts().subscribe(val => {
      expect(val).toBe(2);
      done();
    });
  });

 
});
