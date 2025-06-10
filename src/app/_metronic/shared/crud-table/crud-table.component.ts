import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface CrudColumn {
  title: string;
  data: string | null;
  render?: (data: any, type: any, row: any) => string;
}

export interface CrudConfig {
  columns: CrudColumn[];
  ajax?: {
    url: string;
    type?: string;
    data?: any;
  };
  pageLength?: number;
  responsive?: boolean;
  dom?: string;
  createdRow?: (row: any, data: any, dataIndex: any) => void;
}

@Component({
  selector: 'app-crud',
  template: `
    <div class="card">
      <div class="card-header border-0 pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label fw-bold fs-3 mb-1">Datos</span>
        </h3>
      </div>
      <div class="card-body py-3">
        <div class="table-responsive">
          <table class="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr class="fw-bold text-muted">
                <th *ngFor="let column of config?.columns" class="min-w-150px">
                  {{column.title}}
                </th>
                <th class="min-w-100px text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of data">
                <td *ngFor="let column of config?.columns">
                  <span [innerHTML]="getCellData(item, column)"></span>
                </td>
                <td class="text-end">
                  <button class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                          (click)="edit(item)">
                    <i class="ki-duotone ki-pencil fs-2"></i>
                  </button>
                  <button class="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                          (click)="delete(item)">
                    <i class="ki-duotone ki-trash fs-2"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="loading">
                <td [attr.colspan]="(config?.columns?.length || 0) + 1" class="text-center">
                  <div class="spinner-border spinner-border-sm" role="status"></div>
                  Cargando...
                </td>
              </tr>
              <tr *ngIf="!loading && (!data || data.length === 0)">
                <td [attr.colspan]="(config?.columns?.length || 0) + 1" class="text-center text-muted">
                  No hay datos disponibles
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class CrudTableComponent implements OnInit, OnDestroy {
  @Input() datatableConfig!: CrudConfig;
  @Input() route?: string;
  @Input() reload: any;
  @Input() modal: any;

  @Output() deleteEvent = new EventEmitter<any>();
  @Output() editEvent = new EventEmitter<any>();
  @Output() createEvent = new EventEmitter<void>();

  data: any[] = [];
  loading = false;
  
  config: CrudConfig | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.config = this.datatableConfig;
    this.loadData();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  loadData() {
    if (!this.config?.ajax?.url) {
      return;
    }

    this.loading = true;
    const url = this.config.ajax.url.startsWith('http') 
      ? this.config.ajax.url 
      : `${environment.apiUrl}${this.config.ajax.url}`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        // Handle different response formats
        if (response.data) {
          this.data = response.data;
        } else if (Array.isArray(response)) {
          this.data = response;
        } else if (response.users) {
          this.data = response.users;
        } else if (response.roles) {
          this.data = response.roles;
        } else if (response.permissions) {
          this.data = response.permissions;
        } else {
          this.data = [];
        }
        this.loading = false;
      },
      error: (error) => {
        
        this.data = [];
        this.loading = false;
      }
    });
  }

  getCellData(item: any, column: CrudColumn): string {
    if (column.render) {
      return column.render(item[column.data || ''], 'display', item);
    }
    
    if (column.data) {
      const value = this.getNestedProperty(item, column.data);
      return value || '-';
    }
    
    return '-';
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o && o[p], obj);
  }

  edit(item: any) {
    this.editEvent.emit(item.id || item);
  }

  delete(item: any) {
    this.deleteEvent.emit(item.id || item);
  }

  create() {
    this.createEvent.emit();
  }
} 