import { Component } from '@angular/core';
import { ProductService } from '../service/product.service';
import { ToastrService } from 'ngx-toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ProductLimitService } from '../service/product-limit.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent {

  title:string = '';
  sku:string = '';
  resumen:string = '';
  price_pen:number = 0;
  price_usd:number = 0;
  description:string = '';
  imagen_previsualiza:any = "https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg";
  file_imagen:any = null;
  marca_id:string = '';
  marcas:any = []

  isLoading$:any;

  categorie_first_id:string = '';
  categorie_second_id:string = '';
  categorie_third_id:string = '';
  categories_first:any = [];
  categories_seconds:any = [];
  categories_seconds_backups:any = [];
  categories_thirds:any = [];
  categories_thirds_backups:any = [];

  dropdownList:any = [];
  selectedItems:any = [];
  dropdownSettings:IDropdownSettings = {};
  word:string = '';

  isShowMultiselect:Boolean = false;

  canCreate = true;
  limitMessage = '';
  
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
    private productLimit: ProductLimitService,
  ) {

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.isLoading$ = this.productService.isLoading$;

    // this.dropdownList = [
    //   { item_id: 5, item_text: 'New Delhi' },
    //   { item_id: 6, item_text: 'Laravest' }
    // ];
    // this.selectedItems = [
    //   { item_id: 6, item_text: 'Laravest' }
    // ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      // itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.configAll();
    this.productLimit.canCreateProduct().subscribe(can => {
      this.canCreate = can;
      if (!can) {
        this.limitMessage = 'Has alcanzado el límite de 3 productos.';
      }
    });
  }

  // Función para generar SKU automáticamente basado en el título
  generateSku() {
    if (this.title && this.title.trim() !== '') {
      // Convertir a mayúsculas, remover caracteres especiales y espacios
      let baseSku = this.title
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '') // Remover espacios
        .substring(0, 6); // Tomar solo los primeros 6 caracteres
      
      // Agregar números aleatorios al final
      const randomNumbers = Math.floor(Math.random() * 999) + 1;
      this.sku = baseSku + randomNumbers.toString().padStart(3, '0');
    }
  }

  // Función que se ejecuta cuando cambia el título
  onTitleChange() {
    this.generateSku();
    this.generateKeywords();
  }

  // Función para generar palabras clave automáticamente
  generateKeywords() {
    // Combinar título, descripción y resumen
    let textoCombinado = '';
    if (this.title) textoCombinado += this.title + ' ';
    if (this.description) textoCombinado += this.description + ' ';
    if (this.resumen) textoCombinado += this.resumen + ' ';

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
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy',
      'did', 'she', 'use', 'way', 'who', 'oil', 'sit', 'set', 'run', 'eat'
    ];
    return stopWords.includes(palabra.toLowerCase());
  }

  // Función que se ejecuta cuando cambia la descripción
  onDescriptionChange() {
    this.generateKeywords();
  }

  // Función que se ejecuta cuando cambia el resumen
  onResumenChange() {
    this.generateKeywords();
  }

  configAll(){
    this.productService.configAll().subscribe((resp:any) => {
      console.log(resp);
      this.marcas = resp.brands;
      this.categories_first = resp.categories_first;
      this.categories_seconds = resp.categories_seconds;
      this.categories_thirds = resp.categories_thirds;
    })
  }

  addItems(){
    console.log("Intentando agregar item:", this.word);
    if (!this.word || this.word.trim() === '') {
      this.toastr.error("Validación", "Debe ingresar una palabra clave");
      return;
    }
    
    this.isShowMultiselect = true;
    let time_date = new Date().getTime();
    this.dropdownList.push({ item_id: time_date, item_text: this.word });
    this.selectedItems.push({ item_id: time_date, item_text: this.word });
    console.log("Item agregado correctamente:", this.word);
    console.log("Lista actualizada:", this.selectedItems);
    
    setTimeout(() => {
      this.word = '';
      this.isShowMultiselect = false;
      this.isLoadingView();
    }, 100);
  }

  processFile($event:any){
    if(!$event.target.files || !$event.target.files[0]) {
      this.toastr.error("Validación","No se seleccionó ninguna imagen");
      return;
    }
    
    const file = $event.target.files[0];
    
    // Validar que el archivo sea del tipo correcto
    if(!this.allowedImageTypes.includes(file.type.toLowerCase())){
      this.toastr.error("Validación", `Tipo de archivo no válido. Solo se permiten: ${this.allowedImageTypes.join(', ').replace(/image\//g, '').toUpperCase()}`);
      // Limpiar el input
      $event.target.value = '';
      return;
    }

    // Validar tamaño del archivo (opcional - 5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if(file.size > maxSize) {
      this.toastr.error("Validación", "El archivo es demasiado grande. Tamaño máximo: 5MB");
      $event.target.value = '';
      return;
    }
    
    this.file_imagen = file;
    let reader = new FileReader();
    reader.readAsDataURL(this.file_imagen);
    reader.onloadend = () => this.imagen_previsualiza = reader.result;
    this.isLoadingView();
  }

  isLoadingView(){
    this.productService.isLoadingSubject.next(true);
    setTimeout(() => {
      this.productService.isLoadingSubject.next(false);
    }, 50);
  }

  changeDepartamento(){
    this.categories_seconds_backups = this.categories_seconds.filter((item:any) => 
    item.categorie_second_id == this.categorie_first_id
    )
  }
  changeCategorie(){
    this.categories_thirds_backups = this.categories_thirds.filter((item:any) => 
    item.categorie_second_id == this.categorie_second_id
    )
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

  save(){
    if(!this.canCreate){
      this.toastr.error('Límite alcanzado', this.limitMessage);
      return;
    }
    console.log("Verificando campos del formulario...");
    
    // Comprobamos cada campo individualmente y mostramos su estado
    console.log("Título:", this.title ? "OK" : "FALTA", this.title);
    console.log("SKU:", this.sku ? "OK" : "FALTA", this.sku);
    console.log("Price USD:", this.price_usd ? "OK" : "FALTA", this.price_usd);
    console.log("Price PEN:", this.price_pen ? "OK" : "FALTA", this.price_pen);
    console.log("Marca ID:", this.marca_id ? "OK" : "FALTA", this.marca_id);
    console.log("Imagen:", this.file_imagen ? "OK" : "FALTA");
    console.log("Categoría First ID:", this.categorie_first_id ? "OK" : "FALTA", this.categorie_first_id);
    console.log("Descripción:", this.description ? "OK" : "FALTA", this.description);
    console.log("Resumen:", this.resumen ? "OK" : "FALTA", this.resumen);
    console.log("SelectedItems:", this.selectedItems.length > 0 ? "OK" : "FALTA", this.selectedItems);
    
    if(!this.title || !this.sku ||  !this.marca_id
      || !this.file_imagen|| !this.categorie_first_id|| !this.description|| !this.resumen|| (this.selectedItems.length == 0)){
      this.toastr.error("Validación","Los campos con el * son obligatorio");
      console.error("Faltan campos requeridos en el formulario");
      return;
    }

    console.log("Todos los campos requeridos están completados. Preparando FormData...");

    let formData = new FormData();
    formData.append("title",this.title);
    formData.append("sku",this.sku);
    formData.append("price_usd",this.price_usd+"0");
    formData.append("price_pen",this.price_pen+"0");
    formData.append("brand_id",this.marca_id);
    formData.append("portada",this.file_imagen);
    formData.append("categorie_first_id",this.categorie_first_id);
    if(this.categorie_second_id){
      formData.append("categorie_second_id",this.categorie_second_id);
    }
    if(this.categorie_third_id){
      formData.append("categorie_third_id",this.categorie_third_id);
    }
    formData.append("description",this.description);
    formData.append("resumen",this.resumen);
    formData.append("multiselect",JSON.stringify(this.selectedItems));

    console.log("FormData preparado. Enviando solicitud para crear producto...");
    
    this.productService.createProducts(formData).subscribe({
      next: (resp: any) => {
        console.log("Respuesta del servidor:", resp);
        
        if(resp.message == 403){
          this.toastr.error("Error de permisos", resp.message_text);
          console.error("Error 403: ", resp.message_text);
        } else if (resp.message == 500) {
          this.toastr.error("Error del servidor", resp.message_text);
          console.error("Error 500: ", resp.message_text);
        } else if (resp.message == 400) {
          this.toastr.error("Error de validación", resp.message_text);
          console.error("Error 400: ", resp.message_text);
        } else {
          // Resetear formulario
          this.title = '';
          this.file_imagen = null;
          this.sku = '';
          this.price_usd = 0;
          this.price_pen = 0;
          this.marca_id = '';
          this.categorie_first_id = '';
          this.categorie_second_id = '';
          this.categorie_third_id = '';
          this.description = '';
          this.resumen = '';
          this.selectedItems = [];
    
          this.imagen_previsualiza = "https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg";
          this.toastr.success("Éxito","El producto se registró correctamente");
          console.log("Producto creado exitosamente con ID: ", resp.product_id);
        }
      },
      error: (error: any) => {
        console.error("Error al crear producto:", error);
        
        if (error.status === 403) {
          this.toastr.error("Error de permisos", "No tienes permiso para crear productos");
          console.error("Error 403 en la respuesta del servidor");
        } else if (error.error && error.error.message_text) {
          this.toastr.error("Error", error.error.message_text);
          console.error("Error con mensaje específico: ", error.error.message_text);
        } else {
          this.toastr.error("Error", "Ha ocurrido un error al crear el producto");
          console.error("Error desconocido al crear el producto");
        }
      }
    });
  }

}