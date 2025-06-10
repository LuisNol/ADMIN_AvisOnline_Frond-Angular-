import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/_fake/services/user-service';

@Component({
  selector: 'app-delete-user-modal',
  templateUrl: './delete-user-modal.component.html',
  styleUrls: ['./delete-user-modal.component.scss']
})
export class DeleteUserModalComponent {
  @Input() user: any;
  
  @Output() UserDeleted: EventEmitter<any> = new EventEmitter();
  isLoading: boolean = false;
  
  constructor(
    public userService: UserService,
    private toastr: ToastrService,
    public modal: NgbActiveModal,
  ) {}

  ngOnInit(): void {
    // Inicializar isLoading como false
    this.isLoading = false;
  }
  
  delete() {
    this.isLoading = true;
    
    this.userService.deleteUser(this.user.id).subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        if (resp.error) {
          this.toastr.error("Error", resp.error);
        } else {
          this.toastr.success("Éxito", "Usuario eliminado correctamente");
          this.UserDeleted.emit({ message: 200 });
          this.modal.close();
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.error || error.error?.message || 'Error al eliminar el usuario';
        this.toastr.error("Error", errorMessage);
      }
    });
  }
} 