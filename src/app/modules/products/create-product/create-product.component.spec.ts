import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AlertComponent } from 'src/app/shared/components/alert/alert.component';
import { ProductLimitService } from '../service/product-limit.service';
import { CreateProductComponent } from './create-product.component';
import { ProductService } from '../service/product.service';
import { ToastrService } from 'ngx-toastr';

class LimitStub {
  canCreate = true;
  canCreateProduct() { return of(this.canCreate); }
}

describe('CreateProductComponent UI', () => {
  let component: CreateProductComponent;
  let fixture: ComponentFixture<CreateProductComponent>;
  let limit: LimitStub;

  beforeEach(() => {
    limit = new LimitStub();
    TestBed.configureTestingModule({
      declarations: [CreateProductComponent, AlertComponent],
      imports: [FormsModule],
      providers: [
        { provide: ProductLimitService, useValue: limit },
        { provide: ProductService, useValue: { configAll: () => of(null) } },
        { provide: ToastrService, useValue: { error: () => {}, success: () => {} } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CreateProductComponent);
    component = fixture.componentInstance;
  });

  it('should enable button when client has less than 3', () => {
    limit.canCreate = true;
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeFalse();
  });

  it('should disable button and show message when client has 3 or more', () => {
    limit.canCreate = false;
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();

    expect(fixture.nativeElement.textContent).toContain('Has alcanzado el límite de 3 productos.');

  });

  it('admin should enable button always', () => {
    limit.canCreate = true;
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeFalse();
  });
});
