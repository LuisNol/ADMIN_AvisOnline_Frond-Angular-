import { Component } from '@angular/core';
import { CategoriesService } from '../service/categories.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteCategorieComponent } from '../delete-categorie/delete-categorie.component';

@Component({
  selector: 'app-list-categorie',
  templateUrl: './list-categorie.component.html',
  styleUrls: ['./list-categorie.component.scss']
})
export class ListCategorieComponent {


  categories:any = [];
  search:string = '';
  totalPages:number = 0;
  currentPage:number = 1;

  isLoading$:any;
  constructor(
    public categorieService: CategoriesService,
    public modalService: NgbModal,
  ) {
    
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log('🚀 CATEGORIAS COMPONENT: ngOnInit ejecutado');
    console.log('🔑 Token actual:', localStorage.getItem('token'));
    console.log('👤 Usuario actual:', localStorage.getItem('user'));
    
    this.listCategories();
    this.isLoading$ = this.categorieService.isLoading$;
  }

  listCategories(page = 1){
    this.categorieService.listCategories(page,this.search).subscribe({
      next: (resp:any) => {
        console.log('Respuesta completa de categorías:', resp);
        
        // Validar que la respuesta tenga la estructura esperada
        if (resp && resp.categories && resp.categories.data) {
          // Filtrar categorías válidas (que tengan al menos id y name)
          this.categories = resp.categories.data.filter((cat: any) => cat && cat.id && cat.name);
          this.totalPages = resp.total || 0;
          this.currentPage = page;
          
          console.log('Categorías procesadas:', this.categories.length);
          console.log('Categorías válidas:', this.categories);
        } else {
          console.error('Estructura de respuesta inesperada:', resp);
          this.categories = [];
          this.totalPages = 0;
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        if (error.status === 403) {
          console.error('Error de permisos para categorías');
        } else if (error.status === 401) {
          console.error('Token expirado o inválido');
        }
        this.categories = [];
        this.totalPages = 0;
      }
    })
  }
    
  searchTo(){
    this.listCategories();
  }

  loadPage($event:any){
    console.log($event);
    this.listCategories($event);
  }

  getDomParser(categorie:any){
    var miDiv:any = document.getElementById('svg-categorie-'+categorie.id);
    miDiv.innerHTML = categorie.icon; 
    return '';
  }

  deleteCategorie(categorie:any) {
    const modalRef = this.modalService.open(DeleteCategorieComponent,{centered:true, size: 'md'});
    modalRef.componentInstance.categorie = categorie;

    modalRef.componentInstance.CategorieD.subscribe((resp:any) => {
      let INDEX = this.categories.findIndex((item:any) => item.id == categorie.id);
      if(INDEX != -1){
        this.categories.splice(INDEX,1);
      }
    })
  }
}
