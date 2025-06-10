import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-confirmation-modal',
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrls: ['./delete-confirmation-modal.component.scss']
})
export class DeleteConfirmationModalComponent {
  @Input() title: string = '¿Estás seguro de eliminar?';
  @Input() message: string = 'Una vez eliminado, no se podrá revertir esta acción.';
  @Input() itemType: string = 'elemento'; // usuario, rol, permiso, categoría, producto, slider
  @Input() itemName: string = '';
  @Input() isLoading: boolean = false;
  @Input() confirmButtonText: string = 'Eliminar';
  @Input() cancelButtonText: string = 'Cancelar';
  
  @Output() confirmed = new EventEmitter<boolean>();
  @Output() cancelled = new EventEmitter<boolean>();

  constructor(public modal: NgbActiveModal) {}

  onConfirm(): void {
    this.confirmed.emit(true);
  }

  onCancel(): void {
    this.cancelled.emit(true);
    this.modal.dismiss();
  }

  onClose(): void {
    this.cancelled.emit(true);
    this.modal.dismiss();
  }
} 