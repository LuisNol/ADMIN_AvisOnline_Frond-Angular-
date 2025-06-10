import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../modules/auth/services/auth.service';
import { PermissionService } from '../../modules/auth/services/permission.service';
import { 
  isValidObject, 
  getSafeValue, 
  prepareSafeChartData, 
  prepareSafeChartLabels,
  getSafeArray,
  initChartSafely
} from './dashboard-helpers';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Propiedades del usuario
  userName: string = '';
  isAdmin: boolean = false;
  hasManageOwnProducts: boolean = false;
  
  // Propiedades de anuncios para usuarios
  userAnnouncementsCount: number = 0;
  maxAnnouncements: number = 10; // Límite por defecto
  remainingAnnouncements: number = 0;
  
  // Propiedades de estadísticas (para admin)
  totalUsers: number = 0;
  totalProducts: number = 0;
  totalSales: number = 0;
  totalRevenue: number = 0;
  
  // Estado de carga
  isLoading: boolean = false;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.initializeUserData();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    }
  }

  /**
   * Carga los datos del dashboard según el tipo de usuario
   */
  private loadDashboardData(): void {
    this.isLoading = true;
    
    if (this.isAdmin) {
      this.loadAdminDashboard();
    } else {
      this.loadUserDashboard();
    }
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
    // Aquí implementarías la llamada a la API para obtener el conteo de anuncios del usuario
    // Por ahora usamos datos simulados
    
    setTimeout(() => {
      this.userAnnouncementsCount = 3;
      this.maxAnnouncements = 10;
      this.remainingAnnouncements = this.maxAnnouncements - this.userAnnouncementsCount;
      this.isLoading = false;
    }, 1000);
  }

  // Métodos de navegación para usuarios
  createAnnouncement(): void {
    if (this.userAnnouncementsCount >= this.maxAnnouncements) {
      alert('Has alcanzado el límite máximo de anuncios');
      return;
    }
    
    this.router.navigate(['/products/register']);
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
}
