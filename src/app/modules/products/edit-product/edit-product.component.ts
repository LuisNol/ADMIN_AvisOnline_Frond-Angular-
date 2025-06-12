import { Component } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../service/product.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteImagenAddComponent } from './delete-imagen-add/delete-imagen-add.component';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent {

  // ===== CAMPOS PRINCIPALES AVISONLINE =====
  title: string = '';
  sku: string = '';
  price_pen: number = 0;
  description: string = '';
  imagen_previsualiza: any = 'https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg';
  file_imagen: any = null;
  state: number = 1;

  // ===== CAMPOS ESPECÍFICOS PARA ANUNCIOS =====
  location: string = '';
  contact_phone: string = '';
  contact_email: string = '';
  expires_at: string = '';
  views_count: number = 0;

  isLoading$: any;

  // ===== CATEGORÍA (SOLO PRIMER NIVEL) =====
  categorie_first_id: string = '';
  categories_first: any = [];

  // ===== TAGS/ETIQUETAS =====
  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings: IDropdownSettings = {};
  word: string = '';
  isShowMultiselect: Boolean = false;

  // ===== GESTIÓN DE PRODUCTO =====
  PRODUCT_ID: string = '';
  PRODUCT_SELECTED: any;

  // ===== GESTIÓN DE IMÁGENES ADICIONALES =====
  imagen_add: any;
  imagen_add_previsualiza: any = 'https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg';
  images_files: any = [];

  // Array de tipos de archivo de imagen permitidos
  private allowedImageTypes: string[] = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp'
  ];

  constructor(
    public productService: ProductService,
    private toastr: ToastrService,
    private activedRoute: ActivatedRoute,
    public modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.isLoading$ = this.productService.isLoading$;
    
    // Configuración para tags/etiquetas
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Seleccionar Todo',
      unSelectAllText: 'Deseleccionar Todo',
      allowSearchFilter: true
    };

    this.activedRoute.params.subscribe((resp: any) => {
      this.PRODUCT_ID = resp.id;
    });
    this.configAll();
  }

  // ===== CONFIGURACIÓN INICIAL =====
  configAll() {
    this.productService.configAll().subscribe({
      next: (resp: any) => {
        console.log('Configuración editar anuncio cargada:', resp);
        this.categories_first = resp.categories || [];
        this.showProduct();
      },
      error: (error) => {
        console.error('Error al cargar configuración en editar anuncio:', error);
        this.toastr.error("Error", "No se pudo cargar la configuración necesaria");
      }
    });
  }

  // ===== CARGAR DATOS DEL ANUNCIO =====
  showProduct() {
    this.productService.showProduct(this.PRODUCT_ID).subscribe({
      next: (resp: any) => {
        console.log('Datos del anuncio cargados:', resp);
        this.PRODUCT_SELECTED = resp.product;
        
        // Campos principales
        this.title = resp.product.title || '';
        this.sku = resp.product.sku || '';
        this.price_pen = resp.product.price_pen || 0;
        this.description = resp.product.description || '';
        this.imagen_previsualiza = resp.product.imagen || this.imagen_previsualiza;
        this.state = resp.product.state || 1;
        
        // Campos específicos de anuncios
        this.location = resp.product.location || '';
        this.contact_phone = resp.product.contact_phone || '';
        this.contact_email = resp.product.contact_email || '';
        this.expires_at = resp.product.expires_at ? resp.product.expires_at.split(' ')[0] : '';
        this.views_count = resp.product.views_count || 0;
        
        // Categoría
        this.categorie_first_id = resp.product.categorie_first_id || '';
        
        // Tags
        this.selectedItems = resp.product.tags || [];
        this.dropdownList = resp.product.tags || [];
        
        // Imágenes adicionales
        this.images_files = resp.product.images || [];
      },
      error: (error) => {
        console.error('Error al cargar el anuncio:', error);
        this.toastr.error("Error", "No se pudo cargar el anuncio");
      }
    });
  }

  // ===== GESTIÓN DE TAGS =====
  addItems() {
    if (!this.word || this.word.trim() === '') {
      this.toastr.error("Validación", "Debe ingresar una etiqueta");
      return;
    }
    
    this.isShowMultiselect = true;
    const time_date = new Date().getTime();
    this.dropdownList.push({ item_id: time_date, item_text: this.word });
    this.selectedItems.push({ item_id: time_date, item_text: this.word });
    
    setTimeout(() => {
      this.word = '';
      this.isShowMultiselect = false;
      this.isLoadingView();
    }, 100);
  }

  // ===== MANEJO DE IMAGEN PRINCIPAL =====
  processFile($event: any) {
    if (!$event.target.files || !$event.target.files[0]) {
      this.toastr.error("Validación", "No se seleccionó ninguna imagen");
      return;
    }
    
    const file = $event.target.files[0];
    
    // Validar tipo de archivo
    if (!this.allowedImageTypes.includes(file.type.toLowerCase())) {
      this.toastr.error("Validación", `Tipo de archivo no válido. Solo se permiten: ${this.allowedImageTypes.join(', ').replace(/image\//g, '').toUpperCase()}`);
      $event.target.value = '';
      return;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastr.error("Validación", "El archivo es demasiado grande. Tamaño máximo: 5MB");
      $event.target.value = '';
      return;
    }
    
    this.file_imagen = file;
    const reader = new FileReader();
    reader.readAsDataURL(this.file_imagen);
    reader.onloadend = () => this.imagen_previsualiza = reader.result;
    this.isLoadingView();
  }

  // ===== MANEJO DE IMÁGENES ADICIONALES =====
  processFileTwo($event: any) {
    if (!$event.target.files || !$event.target.files[0]) {
      this.toastr.error("Validación", "No se seleccionó ninguna imagen");
      return;
    }
    
    const file = $event.target.files[0];
    
    // Validar tipo de archivo
    if (!this.allowedImageTypes.includes(file.type.toLowerCase())) {
      this.toastr.error("Validación", `Tipo de archivo no válido. Solo se permiten imágenes`);
      $event.target.value = '';
      return;
    }
    
    this.imagen_add = file;
    const reader = new FileReader();
    reader.readAsDataURL(this.imagen_add);
    reader.onloadend = () => this.imagen_add_previsualiza = reader.result;
    this.isLoadingView();
  }

  addImagen() {
    if (!this.imagen_add) {
      this.toastr.error("Validación", "Debe seleccionar una imagen");
      return;
    }
    
    const formData = new FormData();
    formData.append('imagen_add', this.imagen_add);
    formData.append('product_id', this.PRODUCT_ID);
    
    this.productService.imagenAdd(formData).subscribe({
      next: (resp: any) => {
        this.images_files.unshift(resp.imagen);
        this.imagen_add = null;
        this.imagen_add_previsualiza = 'https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg';
        this.toastr.success("Éxito", "Imagen agregada correctamente");
      },
      error: (error) => {
        console.error('Error al agregar imagen:', error);
        this.toastr.error("Error", "No se pudo agregar la imagen");
      }
    });
  }

  removeImages(id: number) {
    const modalRef = this.modalService.open(DeleteImagenAddComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.id = id;

    modalRef.componentInstance.ImagenD.subscribe(() => {
      const index = this.images_files.findIndex((item: any) => item.id === id);
      if (index !== -1) this.images_files.splice(index, 1);
    });
  }

  // ===== UTILIDADES =====
  isLoadingView() {
    this.productService.isLoadingSubject.next(true);
    setTimeout(() => {
      this.productService.isLoadingSubject.next(false);
    }, 50);
  }

  public onChange(event: any) {
    this.description = event.editor.getData();
  }

  onItemSelect(item: any) {
    console.log(item);
  }

  onSelectAll(items: any) {
    console.log(items);
  }

  // ===== VALIDACIONES =====
  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  validatePhone(phone: string): boolean {
    const phonePattern = /^[+]?[0-9\s\-\(\)]{7,15}$/;
    return phonePattern.test(phone);
  }

  // ===== ELIMINAR ANUNCIO =====
  deleteProduct() {
    if (confirm('¿Estás seguro de que deseas eliminar este anuncio? Esta acción no se puede deshacer.')) {
      this.productService.deleteProduct(this.PRODUCT_ID).subscribe({
        next: (resp: any) => {
          console.log('Anuncio eliminado:', resp);
          this.toastr.success("Éxito", "Anuncio eliminado correctamente");
          // Redirigir al listado
          window.history.back();
        },
        error: (error) => {
          console.error('Error al eliminar anuncio:', error);
          this.toastr.error("Error", "No se pudo eliminar el anuncio");
        }
      });
    }
  }

  // ===== GUARDAR CAMBIOS =====
  save() {
    console.log("Verificando campos del formulario...");
    
    // Validaciones básicas requeridas (solo 4 campos obligatorios)
    if (!this.title || !this.categorie_first_id || !this.description) {
      this.toastr.error("Validación", "Los campos con * son obligatorios: Título, Categoría y Descripción");
      return;
    }

    // Validaciones específicas de formato
    if (this.contact_email && !this.validateEmail(this.contact_email)) {
      this.toastr.error("Validación", "El formato del email de contacto no es válido");
      return;
    }

    if (this.contact_phone && !this.validatePhone(this.contact_phone)) {
      this.toastr.error("Validación", "El formato del teléfono no es válido (7-15 dígitos)");
      return;
    }

    if (this.price_pen && this.price_pen <= 0) {
      this.toastr.error("Validación", "El precio debe ser mayor a 0");
      return;
    }

    console.log("Todos los campos son válidos. Preparando FormData...");

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('sku', this.sku);
    formData.append('description', this.description);
    formData.append('categorie_first_id', this.categorie_first_id);
    formData.append('state', this.state.toString());
    
    // Campos opcionales principales
    if (this.price_pen && this.price_pen > 0) {
      formData.append('price_pen', this.price_pen.toString());
    }
    if (this.location) {
      formData.append('location', this.location);
    }
    
    // Más campos opcionales
    if (this.contact_phone) {
      formData.append('contact_phone', this.contact_phone);
    }
    if (this.contact_email) {
      formData.append('contact_email', this.contact_email);
    }
    // Siempre enviar fecha de expiración si existe
    if (this.expires_at) {
      formData.append('expires_at', this.expires_at);
    }
    
    // Imagen principal (solo si se cambió)
    if (this.file_imagen) {
      formData.append('portada', this.file_imagen);
    }
    
    // Tags
    if (this.selectedItems && this.selectedItems.length > 0) {
      formData.append('tags', JSON.stringify(this.selectedItems));
    }

    console.log("FormData preparado. Enviando solicitud para actualizar anuncio...");

    this.productService.updateProducts(this.PRODUCT_ID, formData).subscribe({
      next: (resp: any) => {
        console.log("Respuesta del servidor:", resp);
        
        if (resp.message == 403) {
          this.toastr.error("Error de permisos", resp.message_text);
        } else if (resp.message == 500) {
          this.toastr.error("Error del servidor", resp.message_text);
        } else if (resp.message == 400) {
          this.toastr.error("Error de validación", resp.message_text);
        } else {
          this.file_imagen = null;
          this.toastr.success("Éxito", "El anuncio se actualizó correctamente");
          console.log("Anuncio actualizado exitosamente");
        }
      },
      error: (error: any) => {
        console.error("Error al actualizar anuncio:", error);
        
        if (error.status === 403) {
          this.toastr.error("Error de permisos", "No tienes permiso para editar este anuncio");
        } else if (error.error && error.error.message_text) {
          this.toastr.error("Error", error.error.message_text);
        } else {
          this.toastr.error("Error", "Ha ocurrido un error al actualizar el anuncio");
        }
      }
    });
  }
}
