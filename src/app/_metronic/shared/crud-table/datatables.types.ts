// Tipos compatibles con DataTables para mantener el código existente

// Declarar jQuery globalmente
declare var $: any;

export namespace DataTables {
  export interface Settings {
    columns?: ColumnDef[];
    ajax?: any;
    pageLength?: number;
    responsive?: boolean;
    dom?: string;
    createdRow?: (row: any, data: any, dataIndex: any) => void;
    [key: string]: any;
  }

  export interface ColumnDef {
    title?: string;
    data?: string | null;
    render?: (data: any, type?: any, row?: any, meta?: any) => string;
    orderable?: boolean;
    searchable?: boolean;
    className?: string;
    width?: string;
    [key: string]: any;
  }

  export interface AjaxSettings {
    url: string;
    type?: string;
    data?: any;
    dataSrc?: string | ((json: any) => any[]);
  }
} 