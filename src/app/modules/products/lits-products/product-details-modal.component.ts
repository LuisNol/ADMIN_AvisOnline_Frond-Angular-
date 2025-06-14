import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-product-details-modal',
  template: `
    <div class="modal-header bg-primary">
      <h4 class="modal-title text-white">
        <i class="fas fa-info-circle me-2"></i>
        Detalles del Anuncio
      </h4>
      <button type="button" class="btn-close btn-close-white" aria-label="Close" (click)="activeModal.dismiss()">
      </button>
    </div>

    <div class="modal-body">
      <div class="row g-4" *ngIf="product">
        <!-- Imagen del producto -->
        <div class="col-12 text-center" *ngIf="product.imagen">
          <div class="symbol symbol-150px mx-auto mb-4">
            <img [src]="product.imagen" class="rounded" 
                 style="width: 150px; height: 150px; object-fit: cover;" 
                 [alt]="product.title" 
                 onerror="this.src='/assets/media/svg/files/blank-image.svg'">
          </div>
        </div>

        <!-- Información básica -->
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-info text-primary me-2"></i>
                Información Básica
              </h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <strong class="text-gray-700">Título:</strong>
                <div class="text-gray-800">{{ product.title }}</div>
              </div>
              <div class="mb-3">
                <strong class="text-gray-700">SKU:</strong>
                <div class="text-gray-800">{{ product.sku }}</div>
              </div>
              <div class="mb-3">
                <strong class="text-gray-700">ID:</strong>
                <div class="text-gray-800">{{ product.id }}</div>
              </div>
              <div class="mb-3">
                <strong class="text-gray-700">Precio:</strong>
                <div class="text-success fs-4 fw-bold">{{ formatPrice(product.price_pen) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado y ubicación -->
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-map-marker-alt text-warning me-2"></i>
                Estado y Ubicación
              </h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <strong class="text-gray-700">Estado:</strong>
                <div>
                  <span class="badge fs-7"
                        [ngClass]="{
                          'badge-success': product.state === 1,
                          'badge-danger': product.state === 0,
                          'badge-warning': product.state === 2
                        }">
                    <i class="fas me-1" 
                       [ngClass]="{
                         'fa-check-circle': product.state === 1,
                         'fa-times-circle': product.state === 0,
                         'fa-pause-circle': product.state === 2
                       }"></i>
                    {{ getStateText(product.state) }}
                  </span>
                </div>
              </div>
              <div class="mb-3">
                <strong class="text-gray-700">Ubicación:</strong>
                <div class="text-gray-800">{{ product.location }}</div>
              </div>
              <div class="mb-3">
                <strong class="text-gray-700">Categoría:</strong>
                <div class="text-gray-800">{{ product.categorie_first?.name || 'Sin categoría' }}</div>
              </div>
              <div class="mb-3">
                <strong class="text-gray-700">Vistas:</strong>
                <div class="text-primary fs-5 fw-bold">
                  <i class="fas fa-eye me-1"></i>
                  {{ product.views_count || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fechas y contacto -->
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-calendar text-info me-2"></i>
                Fechas y Contacto
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4" *ngIf="product.expires_at">
                  <strong class="text-gray-700">Fecha de Expiración:</strong>
                  <div class="text-gray-800">{{ formatDate(product.expires_at) }}</div>
                </div>
                <div class="col-md-4" *ngIf="product.contact_phone">
                  <strong class="text-gray-700">Teléfono:</strong>
                  <div class="text-gray-800">
                    <a [href]="'tel:' + product.contact_phone" class="text-success">
                      <i class="fas fa-phone me-1"></i>
                      {{ product.contact_phone }}
                    </a>
                  </div>
                </div>
                <div class="col-md-4" *ngIf="product.contact_email">
                  <strong class="text-gray-700">Email:</strong>
                  <div class="text-gray-800">
                    <a [href]="'mailto:' + product.contact_email" class="text-primary">
                      <i class="fas fa-envelope me-1"></i>
                      {{ product.contact_email }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Descripción -->
        <div class="col-12" *ngIf="product.description">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-file-text text-dark me-2"></i>
                Descripción
              </h5>
            </div>
            <div class="card-body">
              <p class="text-gray-800 mb-0">{{ product.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">
        <i class="fas fa-times me-2"></i>
        Cerrar
      </button>
      <button type="button" class="btn btn-primary" (click)="editProduct()">
        <i class="fas fa-edit me-2"></i>
        Editar Anuncio
      </button>
    </div>
  `,
  styles: [`
    .modal-header {
      border-bottom: none;
    }
    .modal-footer {
      border-top: none;
    }
    .card {
      border: 1px solid #e4e6ea;
      box-shadow: 0 0.1rem 0.75rem rgba(0, 0, 0, 0.05);
    }
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #e4e6ea;
    }
  `]
})
export class ProductDetailsModalComponent {
  @Input() product: any;

  constructor(public activeModal: NgbActiveModal) {}

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStateText(state: number): string {
    switch(state) {
      case 1: return 'Activo';
      case 0: return 'Inactivo';
      case 2: return 'Pausado';
      default: return 'Desconocido';
    }
  }

  editProduct(): void {
    this.activeModal.close({ action: 'edit', product: this.product });
  }
} 