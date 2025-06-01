import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IUserModel, UserService } from 'src/app/_fake/services/user-service';
import { DataTablesResponse, IRoleModel, RoleService } from 'src/app/_fake/services/role.service';
import { SweetAlertOptions } from 'sweetalert2';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {
  userForm: FormGroup;
  user: IUserModel;
  userId: number;
  roles: IRoleModel[] = [];
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      type_user: ['ADMIN'],
      roles: [[]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadData();
    });
  }

  loadData(): void {
    this.isLoading = true;
    
    // Cargar roles para el checkbox list
    const rolesRequest = this.roleService.getRoles({}).pipe(
      tap(response => {
        this.roles = response.data;
      })
    );
    
    if (this.userId) {
      // Si tenemos un ID, cargar el usuario
      const userRequest = this.userService.getUser(this.userId).pipe(
        tap(user => {
          this.user = user;
          // Convertir el valor de type_user numérico a string para el select
          let typeUser = 'ADMIN';
          if (typeof user.type_user === 'number') {
            if (user.type_user === 2) {
              typeUser = 'CLIENT';
            } else if (user.type_user === 1) {
              typeUser = 'ADMIN';
            }
          } else if (typeof user.type_user === 'string') {
            typeUser = user.type_user;
          }
          
          this.userForm.patchValue({
            name: user.name,
            email: user.email,
            type_user: typeUser,
            roles: user.roles?.map(r => r.id) || []
          });
        })
      );
      
      // Ejecutar ambas solicitudes en paralelo
      forkJoin([rolesRequest, userRequest]).subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading data', error);
          this.isLoading = false;
        }
      });
    } else {
      // Si es un nuevo usuario, solo cargar los roles
      rolesRequest.subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading roles', error);
          this.isLoading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    const formData = { ...this.userForm.value };
    
    // Si la contraseña está vacía, la eliminamos para que no se envíe
    if (!formData.password) {
      delete formData.password;
    }
    
    // Aseguramos que roles sea un array, incluso si está vacío
    if (!formData.roles) {
      formData.roles = [];
    }
    
    // Log de depuración
    console.log('Datos a enviar al servidor:', formData);
    
    const saveObservable: Observable<IUserModel> = this.userId
      ? this.userService.updateUser(this.userId, formData)
      : this.userService.createUser(formData);
    
    saveObservable.subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.showSuccessAlert();
        this.router.navigate(['/apps/users']);
      },
      error: (error) => {
        console.error('Error saving user', error);
        console.error('Error details:', error.error);
        this.showErrorAlert(error);
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  isRoleSelected(roleId: number): boolean {
    const roles = this.userForm.get('roles')?.value;
    return roles ? roles.includes(roleId) : false;
  }

  toggleRole(roleId: number): void {
    const roles = this.userForm.get('roles')?.value || [];
    const index = roles.indexOf(roleId);
    
    if (index > -1) {
      roles.splice(index, 1);
    } else {
      roles.push(roleId);
    }
    
    this.userForm.patchValue({ roles });
  }

  private showSuccessAlert(): void {
    const alertOptions: SweetAlertOptions = {
      icon: 'success',
      title: 'Operación exitosa',
      text: this.userId ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente',
      confirmButtonText: 'Aceptar'
    };
    // Aquí puedes usar SweetAlert o cualquier otro servicio de notificaciones
    alert(alertOptions.text);
  }

  private showErrorAlert(error: any): void {
    const alertOptions: SweetAlertOptions = {
      icon: 'error',
      title: 'Error',
      text: this.extractErrorMessage(error) || 'Ha ocurrido un error al guardar el usuario',
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