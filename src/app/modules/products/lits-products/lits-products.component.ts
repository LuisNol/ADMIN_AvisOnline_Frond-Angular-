import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../service/product.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteProductComponent } from '../delete-product/delete-product.component';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lits-products',
  templateUrl: './lits-products.component.html',
  styleUrls: ['./lits-products.component.scss']
})
export class LitsProductsComponent implements OnInit, OnDestroy {

  // ===== LISTADO DE ANUNCIOS =====
  products: any = [];
  search: string = '';
  totalPages: number = 0;
  currentPage: number = 1;

  isLoading$: any;

  // ===== FILTROS ESPECÍFICOS PARA AVISONLINE =====
  categorie_first_id: string = '';
  categories_first: any = [];
  
  // ===== SUBSCRIPTIONS =====
  private routerSubscription?: Subscription;
  
  constructor(
    public productService: ProductService,
    public modalService: NgbModal,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isLoading$ = this.productService.isLoading$;
    this.configAll();
    
    // Esperar un momento para que las configuraciones se carguen
    setTimeout(() => {
      this.listProducts();
    }, 200);
    
    // Escuchar navegación para refrescar cuando se navega desde crear anuncio
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navEvent = event as NavigationEnd;
      if (navEvent.url.includes('/products/list')) {
        console.log('Navegando al listado, refrescando...');
        setTimeout(() => {
          this.listProducts();
        }, 100);
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // ===== CONFIGURACIÓN DE CATEGORÍAS =====
  configAll() {
    console.log('🔄 Cargando configuración de anuncios...');
    
    this.productService.configAll().subscribe({
      next: (resp: any) => {
        console.log('✅ Configuración listado anuncios cargada:', resp);
        this.categories_first = resp.categories || [];
        
        // Una vez cargada la configuración, cargar los productos
        console.log('📋 Configuración lista, cargando productos...');
      },
      error: (error) => {
        console.error('❌ Error al cargar configuración de anuncios:', error);
        this.toastr.error("Error", "No se pudo cargar la configuración de anuncios");
        // Continuar sin configuración
        this.categories_first = [];
      }
    })
  }

  // ===== LISTADO DE ANUNCIOS CON FILTROS =====
  listProducts(page = 1) {
    let data = {
      search: this.search,
      categorie_id: this.categorie_first_id, // Usando el nombre que espera el backend
    }
    
    this.productService.listProducts(page, data).subscribe({
      next: (resp: any) => {
        console.log('Respuesta de anuncios:', resp);
        this.products = resp.products.data;
        this.totalPages = resp.total;
        this.currentPage = page;
      },
      error: (err: any) => {
        console.error('Error al cargar anuncios:', err);
        if (err.status === 403) {
          this.toastr.error("Permisos", "No tienes permisos para ver los anuncios");
        } else {
          this.toastr.error("Error", err.error?.message || "Error al cargar anuncios");
        }
      }
    })
  }

  // ===== BÚSQUEDA Y FILTROS =====
  searchTo() {
    this.listProducts();
  }

  searchProducts() {
    this.listProducts();
  }
  
  refreshList() {
    console.log('Refrescando lista manualmente...');
    this.listProducts();
    this.toastr.info('Lista actualizada', 'Los anuncios se han refrescado');
  }

  resetFilters() {
    this.search = '';
    this.categorie_first_id = '';
    this.listProducts();
  }

  loadPage($event: any) {
    console.log($event);
    this.listProducts($event);
  }

  // ===== ELIMINAR ANUNCIO =====
  deleteProduct(product: any) {
    const modalRef = this.modalService.open(DeleteProductComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.product = product;

    modalRef.componentInstance.ProductD.subscribe((resp: any) => {
      let INDEX = this.products.findIndex((item: any) => item.id == product.id);
      if (INDEX != -1) {
        this.products.splice(INDEX, 1);
      }
    })
  }

  delete(productId: string, index: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este anuncio?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: (resp: any) => {
          console.log('Anuncio eliminado:', resp);
          this.products.splice(index, 1);
          this.toastr.success("Éxito", "Anuncio eliminado correctamente");
          
          // Notificar al dashboard para actualizar contador
          this.notifyDashboardUpdate();
        },
        error: (error) => {
          console.error('Error al eliminar anuncio:', error);
          this.toastr.error("Error", "No se pudo eliminar el anuncio");
        }
      });
    }
  }

  /**
   * Notificar al dashboard para actualizar el contador
   */
  private notifyDashboardUpdate(): void {
    // Usar localStorage para comunicar entre componentes
    localStorage.setItem('dashboard_needs_update', 'true');
    
    // También emitir evento personalizado
    window.dispatchEvent(new CustomEvent('anuncio-deleted'));
  }

  // ===== UTILIDADES PARA MOSTRAR DATOS =====
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
      month: 'short',
      day: 'numeric'
    });
  }

  getExpirationStatus(expiresAt: string): string {
    if (!expiresAt) return 'none';
    
    const expiration = new Date(expiresAt);
    const today = new Date();
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'expired';
    } else if (diffDays <= 7) {
      return 'warning';
    } else {
      return 'active';
    }
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // ===== ESTADÍSTICAS =====
  getActiveCount(): number {
    return this.products.filter((p: any) => p.state === 1).length;
  }

  getPendingCount(): number {
    if (!this.products) return 0;
    return this.products.filter((p: any) => {
      if (!p.expires_at) return false;
      const expiration = new Date(p.expires_at);
      const today = new Date();
      const diffTime = expiration.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;
  }

  getTotalViews(): number {
    if (!this.products) return 0;
    return this.products.reduce((total: number, p: any) => total + (p.views_count || 0), 0);
  }

  getExpirationText(expiresAt: string): string {
    if (!expiresAt) return 'Sin fecha';
    
    const expiration = new Date(expiresAt);
    const today = new Date();
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Expirado';
    } else if (diffDays <= 7) {
      return `${diffDays} días`;
    } else {
      return `${diffDays} días`;
    }
  }

  getStateText(state: number): string {
    switch(state) {
      case 1: return 'Activo';
      case 0: return 'Inactivo';
      case 2: return 'Pausado';
      default: return 'Desconocido';
    }
  }
}
