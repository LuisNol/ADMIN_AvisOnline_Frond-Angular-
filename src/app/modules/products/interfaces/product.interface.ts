// ===== INTERFAZ PARA ANUNCIOS AVISONLINE =====
export interface ProductAvisOnline {
  // Campos principales
  id?: number;
  title: string;
  slug?: string;
  sku: string;
  price_pen: number;
  imagen?: string;
  state?: number;
  description: string;
  tags?: string | any[]; // JSON string o array de tags
  
  // Categoría (solo primer nivel)
  categorie_first_id: number;
  categorie_first?: {
    id: number;
    name: string;
  };
  
  // Usuario propietario
  user_id?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  
  // Campos específicos para anuncios clasificados
  location: string;
  contact_phone?: string;
  contact_email?: string;
  expires_at?: string;
  views_count?: number;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  
  // Relaciones
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  imagen: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  icon?: string;
  imagen?: string;
  position?: number;
  state: number;
}

// Interfaz para formularios de creación
export interface CreateProductRequest {
  title: string;
  sku?: string;
  price_pen: number;
  description: string;
  location: string;
  contact_phone?: string;
  contact_email?: string;
  expires_at?: string;
  categorie_first_id: number;
  tags?: any[];
  portada: File;
}

// Interfaz para filtros de búsqueda
export interface ProductSearchFilters {
  search?: string;
  categorie_id?: number;
  location?: string;
  min_price?: number;
  max_price?: number;
  user_id?: number;
}

// Interfaz para respuesta de listado
export interface ProductListResponse {
  products: {
    data: ProductAvisOnline[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  total: number;
}

// Interfaz para configuración del módulo
export interface ProductConfigResponse {
  categories: ProductCategory[];
}

// Estados de anuncio
export enum ProductState {
  INACTIVE = 0,
  ACTIVE = 1,
  PENDING = 2,
  EXPIRED = 3
}

// Tipos de validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T = any> {
  message: number;
  message_text: string;
  data?: T;
} 