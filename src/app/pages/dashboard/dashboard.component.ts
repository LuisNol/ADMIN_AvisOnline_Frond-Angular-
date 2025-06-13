<<<<<<< HEAD
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../modules/auth/services/auth.service';
import { PermissionService } from '../../modules/auth/services/permission.service';
import { ProductService } from '../../modules/products/service/product.service';
import {
  isValidObject, 
  prepareSafeChartData, 
  getSafeValue, 
  prepareSafeChartLabels,
  getSafeArray,
  initChartSafely
} from './dashboard-helpers';
=======
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SalesService } from 'src/app/modules/sales/service/sales.service';
import { getSafeArray, getSafeValue, initChartSafely, isValidObject } from './dashboard-helpers';
import { PermissionService } from 'src/app/modules/auth/services/permission.service';
import { ProductLimitService } from 'src/app/modules/products/service/product-limit.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
>>>>>>> c172c0906610bd2b0782d2850e9c672d85f23cdc

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
<<<<<<< HEAD
  // Propiedades del usuario
  userName: string = '';
  isAdmin: boolean = false;
  hasManageOwnProducts: boolean = false;
  
  // Propiedades para usuarios normales (clasificados)
  userAnnouncementsCount: number = 0;
  maxAnnouncements: number = 5; // CAMBIADO DE 10 A 5 
  remainingAnnouncements: number = 5;
  
  // Propiedades de estadísticas (para admin)
  totalUsers: number = 0;
  totalProducts: number = 0;
  totalSales: number = 0;
  totalRevenue: number = 0;
  
  // Estado de carga
  isLoading: boolean = false;
  
  // ===== SUBSCRIPTIONS =====
  private routerSubscription?: Subscription;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private permissionService: PermissionService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
  ) {}

=======
  // Controlar el acceso limitado para usuarios con manage-own-products
  hasFullAccess: boolean = false;
  hasLimitedAccess: boolean = false;
  limitedAccessMessage: string = '';
  remainingAttempts: number = 0;
  
  constructor(
   public salesService: SalesService,
   private permissionService: PermissionService,
   private router: Router,
   private toastr: ToastrService,
   private productLimit: ProductLimitService
  ) {}

  async openModal() {
    return await this.modalComponent.open();
  }

  fetchRemainingAttempts() {
    this.productLimit.getRemainingAttempts().subscribe(count => {
      this.remainingAttempts = count;
      if (count <= 0) {
        this.limitedAccessMessage = 'Ya no puedes crear m\u00e1s anuncios. Actualiza tu plan.';
      }
    });
  }

>>>>>>> c172c0906610bd2b0782d2850e9c672d85f23cdc
  ngOnInit(): void {
    console.log('🚀 Dashboard inicializado');
    this.isLoading = true;
    
<<<<<<< HEAD
    this.initializeUserData();
    this.loadDashboardData();
    
    // Escuchar navegación del router
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/' || event.url.includes('/dashboard')) {
        console.log('🔄 Navegación detectada, recargando dashboard...', event.url);
        setTimeout(() => {
          this.reloadDashboard();
        }, 100);
=======
    this.hasFullAccess = isAdmin || hasManageProducts;
    this.hasLimitedAccess = !this.hasFullAccess && hasManageOwnProducts;

    if (this.hasLimitedAccess) {
      this.fetchRemainingAttempts();
    }

    if (!this.hasFullAccess && !this.hasLimitedAccess) {
      this.toastr.error('No tienes permisos para acceder al dashboard', 'Error de permisos');
      this.router.navigate(['/products/list']);
      return;
    }

    const toastMsg = localStorage.getItem('dashboardToast');
    if (toastMsg) {
      this.toastr.info(toastMsg);
      localStorage.removeItem('dashboardToast');
    }
    
   this.isLoading$ = this.salesService.isLoading$;
   
   this.salesService.configAllReport().subscribe({
      next: (resp: any) => {
        console.log(resp);
        
        // Verificar si tiene acceso limitado (desde el backend)
        if (resp.limited_access) {
          this.hasLimitedAccess = true;
          this.hasFullAccess = false;
          this.limitedAccessMessage = resp.message || 'Acceso limitado al dashboard';
          this.toastr.info(this.limitedAccessMessage);
          this.fetchRemainingAttempts();
        }
        
        // meses , año y mes
        this.meses = getSafeArray(resp.meses);
        this.year_current = getSafeValue(resp, 'year', '2025');
        this.month_current = getSafeValue(resp, 'month', '01');
        // 
        this.year_1 = getSafeValue(resp, 'year', '2025');
        this.month_1 = getSafeValue(resp, 'month', '01');
        this.year_2 = getSafeValue(resp, 'year', '2025');
        this.month_2 = getSafeValue(resp, 'month', '01');
        this.year_3 = getSafeValue(resp, 'year', '2025');
        this.year_4 = getSafeValue(resp, 'year', '2025');
        this.month_4 = getSafeValue(resp, 'month', '01');
        this.year_5 = getSafeValue(resp, 'year', '2025');
        this.month_5 = getSafeValue(resp, 'month', '01');
        
        // Solo cargar informes si tiene acceso completo
        if (this.hasFullAccess) {
          this.loadAllReports();
        }
      },
      error: (error) => {
        console.error('Error al cargar configuración del dashboard:', error);
        if (error.status === 403) {
          this.toastr.error('No tienes permisos para acceder al dashboard', 'Error de permisos');
          this.router.navigate(['/products/list']);
        }
>>>>>>> c172c0906610bd2b0782d2850e9c672d85f23cdc
      }
    });
    
    // Escuchar eventos de actualización de anuncios
    window.addEventListener('announcementUpdated', () => {
      console.log('📡 Evento de actualización de anuncio recibido');
      setTimeout(() => this.loadUserAnnouncementsCount(), 500);
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Limpiar listeners
    window.removeEventListener('anuncio-created', this.handleAnuncioUpdate.bind(this));
    window.removeEventListener('anuncio-deleted', this.handleAnuncioUpdate.bind(this));
    
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  /**
   * Inicializa los datos del usuario
   */
  private initializeUserData(): void {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      this.userName = currentUser.name || 'Usuario';
      this.isAdmin = this.permissionService.hasRole('Admin');
      this.hasManageOwnProducts = this.permissionService.hasPermission('manage-own-announcements');
      
      console.log('Usuario inicializado:', {
        name: this.userName,
        isAdmin: this.isAdmin,
        hasManageOwnProducts: this.hasManageOwnProducts
      });
    } else {
      console.warn('No hay usuario autenticado');
    }
  }

  /**
   * Carga los datos del dashboard según el tipo de usuario
   */
  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Esperar un momento para asegurar que los permisos estén cargados
    setTimeout(() => {
      if (this.isAdmin) {
        this.loadAdminDashboard();
      } else if (this.hasManageOwnProducts) {
        this.loadUserDashboard();
      } else {
        console.warn('Usuario sin permisos para ver anuncios');
        this.isLoading = false;
      }
    }, 100);
  }

  /**
   * Carga datos específicos para administradores
   */
  private loadAdminDashboard(): void {
    // Aquí puedes implementar llamadas a APIs para obtener estadísticas
    // Por ahora usamos datos simulados
    
    setTimeout(() => {
      this.totalUsers = 150;
      this.totalProducts = 450;
      this.totalSales = 120;
      this.totalRevenue = 25000;
      this.isLoading = false;
    }, 1000);
  }

  /**
   * Carga datos específicos para usuarios normales
   */
  private loadUserDashboard(): void {
    // Cargar datos reales del usuario desde la API
    this.loadUserAnnouncementsCount();
  }

  /**
   * Cargar conteo real de anuncios del usuario
   */
  private loadUserAnnouncementsCount(): void {
    console.log('🔄 Cargando estadísticas del usuario...');
    
    this.productService.getUserStats().subscribe({
      next: (resp: any) => {
        console.log('✅ Estadísticas del usuario obtenidas:', resp);
        
        if (resp.stats) {
          // Asignar valores y forzar actualización
          this.userAnnouncementsCount = Number(resp.stats.total_announcements) || 0;
          this.maxAnnouncements = Number(resp.stats.max_allowed) || 5;
          this.remainingAnnouncements = Number(resp.stats.remaining_slots) || 0;
          
          console.log('📊 Estadísticas aplicadas:', {
            current: this.userAnnouncementsCount,
            max: this.maxAnnouncements,
            remaining: this.remainingAnnouncements
          });
          
          // FORZAR CHANGE DETECTION
          this.cdr.detectChanges();
          
        } else {
          console.warn('⚠️ Respuesta sin datos de estadísticas');
          this.setDefaultValues();
        }
        
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar estadísticas del usuario:', error);
        
        // Si es error 401, el usuario no está autenticado
        if (error.status === 401) {
          console.warn('Usuario no autenticado, redirigiendo al login...');
          this.setDefaultValues();
          this.isLoading = false;
        } else {
          // Para otros errores, intentar método fallback
          console.log('🔄 Intentando método fallback...');
          this.loadUserAnnouncementsCountFallback();
        }
      }
    });
  }
  
  /**
   * Establecer valores por defecto
   */
  private setDefaultValues(): void {
    this.userAnnouncementsCount = 0;
    this.maxAnnouncements = 5;
    this.remainingAnnouncements = 5;
    this.isLoading = false;
    
    // FORZAR CHANGE DETECTION
    this.cdr.detectChanges();
  }
  
  /**
   * Método fallback para cargar anuncios (método anterior)
   */
  private loadUserAnnouncementsCountFallback(): void {
    this.productService.listProducts(1, {}).subscribe({
      next: (resp: any) => {
        console.log('Usando método fallback para obtener anuncios del usuario:', resp);
        // Si hay datos paginados
        if (resp.products && resp.products.data) {
          this.userAnnouncementsCount = resp.products.data.length;
        } else if (resp.products) {
          // Si no está paginado
          this.userAnnouncementsCount = resp.products.length;
        } else {
          this.userAnnouncementsCount = 0;
        }
        
        this.remainingAnnouncements = this.maxAnnouncements - this.userAnnouncementsCount;
        this.isLoading = false;
        
        console.log('Conteo actualizado (fallback):', {
          current: this.userAnnouncementsCount,
          max: this.maxAnnouncements,
          remaining: this.remainingAnnouncements
        });
      },
      error: (error: any) => {
        console.error('Error al cargar anuncios del usuario (fallback):', error);
        this.userAnnouncementsCount = 0;
        this.remainingAnnouncements = this.maxAnnouncements;
        this.isLoading = false;
      }
    });
  }

  // Métodos de navegación para usuarios
  createAnnouncement(): void {
    if (this.userAnnouncementsCount >= this.maxAnnouncements) {
      alert('Has alcanzado el límite máximo de anuncios');
      return;
    }
    
    this.router.navigate(['/products/create-product']);
  }

  listMyAnnouncements(): void {
    this.router.navigate(['/products/list']);
  }

  // Métodos de navegación para administradores
  manageCategories(): void {
    this.router.navigate(['/categories']);
  }

  manageSliders(): void {
    this.router.navigate(['/sliders/list']);
  }

  manageUsers(): void {
    this.router.navigate(['/apps/users']);
  }

  manageRoles(): void {
    this.router.navigate(['/apps/roles']);
  }

  managePermissions(): void {
    this.router.navigate(['/apps/permissions']);
  }

  manageCoupons(): void {
    this.router.navigate(['/cupones/list']);
  }

  manageDiscounts(): void {
    this.router.navigate(['/discount/list']);
  }

  viewSales(): void {
    this.router.navigate(['/sales/list']);
  }

  viewReports(): void {
    this.router.navigate(['/reports']);
  }

  // Métodos de utilidad
  refreshDashboard(): void {
    this.loadDashboardData();
  }

  /**
   * Obtiene el saludo según la hora del día
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'Buenos días';
    } else if (hour < 18) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  }

  /**
   * Calcula el porcentaje de uso de anuncios
   */
  getAnnouncementUsagePercentage(): number {
    if (this.maxAnnouncements === 0) return 0;
    return Math.round((this.userAnnouncementsCount / this.maxAnnouncements) * 100);
  }

  /**
   * Devuelve la clase CSS según el porcentaje de uso
   */
  getUsageProgressClass(): string {
    const percentage = this.getAnnouncementUsagePercentage();
    
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  }

  /**
   * Recargar datos del dashboard (para usar después de crear/eliminar anuncios)
   */
  public reloadDashboard(): void {
    if (!this.isAdmin) {
      this.loadUserAnnouncementsCount();
    }
  }

  /**
   * Configurar listeners para eventos de anuncios
   */
  private setupAnuncioEventListeners(): void {
    window.addEventListener('anuncio-created', this.handleAnuncioUpdate.bind(this));
    window.addEventListener('anuncio-deleted', this.handleAnuncioUpdate.bind(this));
  }
  
  /**
   * Manejar actualización de anuncios
   */
  private handleAnuncioUpdate(): void {
    console.log('Evento de anuncio detectado, actualizando dashboard...');
    this.reloadDashboard();
  }
  
  /**
   * Verificar si hay actualizaciones pendientes desde localStorage
   */
  private checkForUpdates(): void {
    const needsUpdate = localStorage.getItem('dashboard_needs_update');
    if (needsUpdate === 'true') {
      localStorage.removeItem('dashboard_needs_update');
      setTimeout(() => {
        this.reloadDashboard();
      }, 500);
    }
  }
}