import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, map } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IPermissionModel, PermissionService } from 'src/app/_fake/services/permission.service';
import { IRoleModel, RoleService } from 'src/app/_fake/services/role.service';
import { SweetAlertOptions } from 'sweetalert2';

@Component({
  selector: 'app-role-edit',
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.scss']
})
export class RoleEditComponent implements OnInit {
  roleForm: FormGroup;
  role: IRoleModel;
  roleId: number;
  permissions: IPermissionModel[] = [];
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      permissions: [[]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.roleId = +params['id'];
      this.loadData();
    });
  }

  loadData(): void {
    this.isLoading = true;
    
    const loadPermissions = this.permissionService.getPermissions({}).pipe(
      map(response => response.data)
    );
    const loadRole = this.roleId ? this.roleService.getRole(this.roleId) : null;

    if (loadRole) {
      forkJoin([loadPermissions, loadRole]).subscribe({
        next: ([permissions, role]) => {
          this.permissions = permissions;
          this.role = role;
          this.roleForm.patchValue({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions.map(p => p.id)
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading data', error);
          this.isLoading = false;
        }
      });
    } else {
      loadPermissions.subscribe({
        next: (permissions) => {
          this.permissions = permissions;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading permissions', error);
          this.isLoading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    const formData = this.roleForm.value;
    
    const saveObservable: Observable<IRoleModel> = this.roleId
      ? this.roleService.updateRole(this.roleId, formData)
      : this.roleService.createRole(formData);
    
    saveObservable.subscribe({
      next: () => {
        this.showSuccessAlert();
        this.router.navigate(['/apps/roles']);
      },
      error: (error) => {
        console.error('Error saving role', error);
        this.showErrorAlert(error);
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  isPermissionSelected(permissionId: number): boolean {
    const permissions = this.roleForm.get('permissions')?.value;
    return permissions ? permissions.includes(permissionId) : false;
  }

  togglePermission(permissionId: number): void {
    const permissions = this.roleForm.get('permissions')?.value || [];
    const index = permissions.indexOf(permissionId);
    
    if (index > -1) {
      permissions.splice(index, 1);
    } else {
      permissions.push(permissionId);
    }
    
    this.roleForm.patchValue({ permissions });
  }

  private showSuccessAlert(): void {
    const alertOptions: SweetAlertOptions = {
      icon: 'success',
      title: 'Operación exitosa',
      text: this.roleId ? 'Rol actualizado correctamente' : 'Rol creado correctamente',
      confirmButtonText: 'Aceptar'
    };
    // Aquí puedes usar SweetAlert o cualquier otro servicio de notificaciones
    alert(alertOptions.text);
  }

  private showErrorAlert(error: any): void {
    const alertOptions: SweetAlertOptions = {
      icon: 'error',
      title: 'Error',
      text: this.extractErrorMessage(error) || 'Ha ocurrido un error al guardar el rol',
      confirmButtonText: 'Aceptar'
    };
    // Aquí puedes usar SweetAlert o cualquier otro servicio de notificaciones
    alert(alertOptions.text);
  }

  private extractErrorMessage(error: any): string {
    if (error.error && typeof error.error === 'object') {
      const messages = [];
      for (const key in error.error) {
        if (Array.isArray(error.error[key])) {
          messages.push(...error.error[key]);
        }
      }
      return messages.join('\n');
    }
    return error.message || error.statusText || 'Error desconocido';
  }
} 