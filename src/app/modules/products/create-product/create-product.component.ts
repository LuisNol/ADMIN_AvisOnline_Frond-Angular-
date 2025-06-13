import { Component } from '@angular/core';
import { ProductService } from '../service/product.service';
import { ToastrService } from 'ngx-toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent {

  // ===== CAMPOS PRINCIPALES AVISONLINE =====
  title: string = '';
  sku: string = '';
  price_pen: number = 0;
  description: string = '';
  imagen_previsualiza: any = "https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg";
  file_imagen: any = null;
  
  // ===== CAMPOS ESPECÍFICOS PARA ANUNCIOS =====
  location: string = '';
  contact_phone: string = '';
  contact_email: string = '';
  expires_at: string = '';
  
  // ===== CATEGORÍA (SOLO PRIMER NIVEL) =====
  categorie_first_id: string = '';
  categories_first: any = [];
  
  // ===== TAGS/ETIQUETAS =====
  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings: IDropdownSettings = {};
  word: string = '';
  isShowMultiselect: Boolean = false;

  isLoading$: any;
  
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
    private router: Router,
  ) {
    
  }

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
    
    // Configurar fecha de expiración por defecto (15 días)
    const defaultExpirationDate = new Date();
    defaultExpirationDate.setDate(defaultExpirationDate.getDate() + 15);
    this.expires_at = defaultExpirationDate.toISOString().split('T')[0];
    
    this.configAll();
  }

  // ===== GENERACIÓN AUTOMÁTICA DE SKU =====
  generateSku() {
    if (this.title && this.title.trim() !== '') {
      // Convertir a mayúsculas, remover caracteres especiales y espacios
      let baseSku = this.title
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '') // Remover espacios
        .substring(0, 6); // Tomar solo los primeros 6 caracteres
      
      // Agregar números aleatorios al final
      const randomNumbers = Math.floor(Math.random() + 1000) + 1;
      this.sku = baseSku + randomNumbers.toString().padStart(4, '0');
    }
  }

  onTitleChange() {
    this.generateSku();
    this.generateKeywords();
  }

  // ===== GENERACIÓN AUTOMÁTICA DE TAGS =====
  generateKeywords() {
    // Combinar título, descripción y ubicación
    let textoCombinado = '';
    if (this.title) textoCombinado += this.title + ' ';
    if (this.description) textoCombinado += this.description + ' ';
    if (this.location) textoCombinado += this.location + ' ';

    if (textoCombinado.trim() === '') return;

    // Limpiar y procesar el texto
    let palabras = textoCombinado
      .toLowerCase()
      .replace(/[^\w\sáéíóúñü]/g, ' ') // Remover caracteres especiales pero mantener acentos
      .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
      .trim()
      .split(' ')
      .filter(palabra => palabra.length > 3) // Solo palabras de más de 3 caracteres
      .filter(palabra => !this.isStopWord(palabra)); // Filtrar palabras vacías

    // Remover duplicados y tomar las primeras 8-10 palabras
    let palabrasUnicas = [...new Set(palabras)].slice(0, 10);

    // Limpiar las palabras clave existentes que fueron generadas automáticamente
    this.selectedItems = this.selectedItems.filter((item: any) => !item.auto_generated);
    this.dropdownList = this.dropdownList.filter((item: any) => !item.auto_generated);

    // Agregar las nuevas palabras clave
    palabrasUnicas.forEach(palabra => {
      let time_date = new Date().getTime() + Math.random();
      let newItem = { 
        item_id: time_date, 
        item_text: palabra,
        auto_generated: true // Marcar como generada automáticamente
      };
      this.dropdownList.push(newItem);
      this.selectedItems.push(newItem);
    });
  }

  // Función para filtrar palabras vacías comunes
  isStopWord(palabra: string): boolean {
    const stopWords = [
      'para', 'con', 'por', 'como', 'una', 'este', 'esta', 'estos', 'estas',
      'del', 'las', 'los', 'una', 'uno', 'sobre', 'entre', 'hasta', 'desde',
      'que', 'son', 'más', 'pero', 'muy', 'bien', 'toda', 'todo', 'hace',
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his'
    ];
    return stopWords.includes(palabra.toLowerCase());
  }

  onDescriptionChange() {
    this.generateKeywords();
  }

  onLocationChange() {
    this.generateKeywords();
  }

  // ===== CONFIGURACIÓN DE CATEGORÍAS =====
  configAll() {
    this.productService.configAll().subscribe({
      next: (resp: any) => {
        console.log('Configuración crear anuncios cargada:', resp);
        this.categories_first = resp.categories || [];
      },
      error: (error) => {
        console.error('Error al cargar configuración en crear anuncio:', error);
        this.toastr.error("Error", "No se pudo cargar la configuración necesaria");
      }
    })
  }

  // ===== GESTIÓN DE TAGS =====
  addItems() {
    console.log("Intentando agregar tag:", this.word);
    if (!this.word || this.word.trim() === '') {
      this.toastr.error("Validación", "Debe ingresar una etiqueta");
      return;
    }
    
    this.isShowMultiselect = true;
    let time_date = new Date().getTime();
    this.dropdownList.push({ item_id: time_date, item_text: this.word });
    this.selectedItems.push({ item_id: time_date, item_text: this.word });
    console.log("Tag agregada correctamente:", this.word);
    
    setTimeout(() => {
      this.word = '';
      this.isShowMultiselect = false;
      this.isLoadingView();
    }, 100);
  }

  // ===== MANEJO DE IMAGEN =====
  processFile($event: any) {
    if (!$event.target.files || !$event.target.files[0]) {
      this.toastr.error("Validación", "No se seleccionó ninguna imagen");
      return;
    }
    
    const file = $event.target.files[0];
    
    // Validar que el archivo sea del tipo correcto
    if (!this.allowedImageTypes.includes(file.type.toLowerCase())) {
      this.toastr.error("Validación", `Tipo de archivo no válido. Solo se permiten: ${this.allowedImageTypes.join(', ').replace(/image\//g, '').toUpperCase()}`);
      $event.target.value = '';
      return;
    }

    // Validar tamaño del archivo (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      this.toastr.error("Validación", "El archivo es demasiado grande. Tamaño máximo: 5MB");
      $event.target.value = '';
      return;
    }
    
    this.file_imagen = file;
    console.log('Archivo de imagen seleccionado:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    let reader = new FileReader();
    reader.readAsDataURL(this.file_imagen);
    reader.onloadend = () => this.imagen_previsualiza = reader.result;
    this.isLoadingView();
  }

  isLoadingView() {
    this.productService.isLoadingSubject.next(true);
    setTimeout(() => {
      this.productService.isLoadingSubject.next(false);
    }, 50);
  }

  // ===== EDITOR DE TEXTO =====
  public onChange(event: any) {
    this.description = event.editor.getData();
  }
  
  onItemSelect(item: any) {
    console.log(item);
  }
  
  onSelectAll(items: any) {
    console.log(items);
  }

  // ===== VALIDACIONES DE EMAIL Y TELÉFONO =====
  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  validatePhone(phone: string): boolean {
    const phonePattern = /^[+]?[0-9\s\-\(\)]{7,15}$/;
    return phonePattern.test(phone);
  }

  // ===== GUARDAR ANUNCIO =====
  save() {
    console.log("Verificando campos del formulario...");
    
    // Validaciones básicas requeridas (solo 4 campos obligatorios)
    if (!this.title || !this.file_imagen || !this.categorie_first_id || !this.description) {
      this.toastr.error("Validación", "Los campos con * son obligatorios: Título, Imagen, Categoría y Descripción");
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

    let formData = new FormData();
    formData.append("title", this.title);
    formData.append("sku", this.sku);
    formData.append("portada", this.file_imagen);
    formData.append("categorie_first_id", this.categorie_first_id);
    formData.append("description", this.description);
    
    // Campos opcionales
    if (this.price_pen && this.price_pen > 0) {
      formData.append("price_pen", this.price_pen.toString());
    }
    if (this.location) {
      formData.append("location", this.location);
    }
    
    // Más campos opcionales
    if (this.contact_phone) {
      formData.append("contact_phone", this.contact_phone);
    }
    if (this.contact_email) {
      formData.append("contact_email", this.contact_email);
    }
    // Siempre enviar fecha de expiración (15 días por defecto)
    formData.append("expires_at", this.expires_at);
    
    // Tags
    if (this.selectedItems.length > 0) {
      formData.append("tags", JSON.stringify(this.selectedItems));
    }

    console.log("FormData preparado. Enviando solicitud para crear anuncio...");
    
    // Debug: Verificar contenido del FormData
    console.log('Contenido del FormData:');
    console.log('- title:', this.title);
    console.log('- sku:', this.sku);
    console.log('- portada (archivo):', this.file_imagen ? this.file_imagen.name + ' (' + this.file_imagen.size + ' bytes)' : 'ninguno');
    console.log('- categorie_first_id:', this.categorie_first_id);
    console.log('- description:', this.description ? this.description.substring(0, 50) + '...' : 'vacío');
    
    this.productService.createProducts(formData).subscribe({
      next: (resp: any) => {
        console.log("Respuesta del servidor:", resp);
        
        if (resp.message == 403) {
          this.toastr.error("Error de permisos", resp.message_text);
        } else if (resp.message == 500) {
          this.toastr.error("Error del servidor", resp.message_text);
        } else if (resp.message == 400) {
          this.toastr.error("Error de validación", resp.message_text);
        } else {
          // Resetear formulario después de éxito
          this.resetForm();
          this.toastr.success("Éxito", "El anuncio se registró correctamente");
          console.log("Anuncio creado exitosamente");
          
          // Emitir evento para actualizar dashboard si existe
          this.notifyDashboardUpdate();
          
          // Redirigir al listado después de 1 segundo
          setTimeout(() => {
            this.router.navigate(['/products/list']);
          }, 1000);
        }
      },
      error: (error: any) => {
        console.error("Error al crear anuncio:", error);
        
        if (error.status === 403) {
          this.toastr.error("Error de permisos", "No tienes permiso para crear anuncios");
        } else if (error.error && error.error.message_text) {
          this.toastr.error("Error", error.error.message_text);
        } else {
          this.toastr.error("Error", "Ha ocurrido un error al crear el anuncio");
        }
      }
    });
  }

  // ===== RESETEAR FORMULARIO =====
  resetForm() {
    this.title = '';
    this.sku = '';
    this.price_pen = 0;
    this.description = '';
    this.location = '';
    this.contact_phone = '';
    this.contact_email = '';
    this.file_imagen = null;
    this.categorie_first_id = '';
    this.selectedItems = [];
    this.dropdownList = [];
    
    // Resetear fecha de expiración (15 días)
    const defaultExpirationDate = new Date();
    defaultExpirationDate.setDate(defaultExpirationDate.getDate() + 15);
    this.expires_at = defaultExpirationDate.toISOString().split('T')[0];
    
    this.imagen_previsualiza = "https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg";
  }

  /**
   * Notificar al dashboard para actualizar el contador
   */
  private notifyDashboardUpdate(): void {
    // Usar localStorage para comunicar entre componentes
    localStorage.setItem('dashboard_needs_update', 'true');
    
    // También emitir evento personalizado
    window.dispatchEvent(new CustomEvent('anuncio-created'));
  }
}