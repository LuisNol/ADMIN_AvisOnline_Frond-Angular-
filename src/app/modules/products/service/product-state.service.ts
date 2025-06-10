import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductStateService {
  
  private productCountSubject = new BehaviorSubject<number>(0);
  public productCount$ = this.productCountSubject.asObservable();

  constructor() { }

  // Actualizar el contador de productos
  updateProductCount(count: number): void {
    
    this.productCountSubject.next(count);
  }

  // Incrementar contador (cuando se crea un producto)
  incrementProductCount(): void {
    const currentCount = this.productCountSubject.value;
    const newCount = currentCount + 1;
    
    this.productCountSubject.next(newCount);
  }

  // Decrementar contador (cuando se elimina un producto)
  decrementProductCount(): void {
    const currentCount = this.productCountSubject.value;
    const newCount = Math.max(0, currentCount - 1);
    
    this.productCountSubject.next(newCount);
  }

  // Obtener el valor actual
  getCurrentCount(): number {
    return this.productCountSubject.value;
  }
} 