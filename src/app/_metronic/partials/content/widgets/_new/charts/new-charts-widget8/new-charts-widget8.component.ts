import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as ApexCharts from 'apexcharts';
import { getCSSVariableValue } from '../../../../../../kt/_utils';
import { SalesService } from 'src/app/modules/sales/service/sales.service';
import { getSafeArray, getSafeValue, isValidObject } from 'src/app/pages/dashboard/dashboard-helpers';

@Component({
  selector: 'app-new-charts-widget8',
  templateUrl: './new-charts-widget8.component.html',
  styleUrls: ['./new-charts-widget8.component.scss'],
})
export class NewChartsWidget8Component implements OnInit {
  @ViewChild('weekChart') weekChart: ElementRef<HTMLDivElement>;
  @ViewChild('monthChart') monthChart: ElementRef<HTMLDivElement>;

  @Input() chartHeight: string = '425px';
  @Input() chartHeightNumber: number = 425;
  @Input() cssClass: string = '';
  tab: 'Week' | 'Month' = 'Week';
  chart1Options: any = {};
  chart2Options: any = {};
  hadDelay: boolean = false;

  @Input() year_current:string;
  @Input() month_current:string;
  @Input() meses:any = [];

  year_1:string = '';
  month_1:string = '';
  report_sale_for_categories:any;
  constructor(
    private cdr: ChangeDetectorRef,
    public salesService: SalesService,) {}

  ngOnInit(): void {
    // this.setupCharts();
    this.year_1 = this.year_current || '2025';
    this.month_1 = this.month_current || '01';
    this.reportSaleForCategories();
  }

  init() {
    try {
      this.chart2Options = getChart2Options(this.chartHeightNumber);
    } catch (error) {
      console.error('Error en init:', error);
      // Valores por defecto en caso de error
      this.chart2Options = getDefaultChartOptions(this.chartHeightNumber);
    }
  }

  setTab(_tab: 'Week' | 'Month') {
    try {
      this.tab = _tab;
      if (_tab === 'Week') {
        this.chart2Options = getChart2Options(this.chartHeightNumber);
      }

      this.setupCharts();
    } catch (error) {
      console.error('Error en setTab:', error);
    }
  }

  setupCharts() {
    try {
      setTimeout(() => {
        this.hadDelay = true;
        this.init();
        this.cdr.detectChanges();
      }, 100);
    } catch (error) {
      console.error('Error en setupCharts:', error);
    }
  }

  reportSaleForCategories(){
    let data = {
       year: this.year_1 || '2025',
       month: this.month_1 || '01',
    }
    this.report_sale_for_categories = null;
    this.salesService.reportSaleForCategories(data).subscribe({
      next: (resp:any) => {
        console.log(resp);
        var series_data:any = [];
        
        this.report_sale_for_categories = resp || { sale_for_categories: [] };
        
        // Asegurar que hay un array válido
        const saleForCategories = getSafeArray(this.report_sale_for_categories.sale_for_categories);
        
        if (saleForCategories.length === 0) {
          // Si no hay datos, usar un valor por defecto
          series_data = [{
            name: 'Sin datos',
            data: [[0, 0, 0]]
          }];
        } else {
          // Procesar los datos disponibles
          saleForCategories.forEach((element:any) => {
            series_data.push({
              name: getSafeValue(element, 'categorie_name', 'Categoría'),
              data: [[
                getSafeValue(element, 'categories_avg', 0),
                getSafeValue(element, 'categories_total', 0),
                getSafeValue(element, 'categories_quantity', 0)
              ]]
            });
          });
        }
        
        // Establecer opciones del gráfico con datos seguros
        this.hadDelay = true;
        try {
          this.chart1Options = getChart1Options(this.chartHeightNumber, series_data);
        } catch (error) {
          console.error('Error al configurar gráfico:', error);
          this.chart1Options = getDefaultChartOptions(this.chartHeightNumber);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error en reportSaleForCategories:', error);
        // En caso de error, establecer opciones por defecto
        this.hadDelay = true;
        this.chart1Options = getDefaultChartOptions(this.chartHeightNumber);
        this.cdr.detectChanges();
      }
    });
  }
}

function getDefaultChartOptions(chartHeightNumber: number) {
  // Configuración mínima para evitar errores
  return {
    series: [{
      name: 'Sin datos',
      data: [[0, 0, 0]]
    }],
    chart: {
      fontFamily: 'inherit',
      type: 'bubble',
      height: chartHeightNumber,
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: 'numeric',
      tickAmount: 7,
      min: 0,
      max: 10,
    },
    yaxis: {
      tickAmount: 7,
      min: 0,
      max: 10,
    },
  };
}

function getChart1Options(chartHeightNumber: number, series_data:Array<any>) {
  try {
    // Asegurar que series_data es un array
    if (!Array.isArray(series_data) || series_data.length === 0) {
      series_data = [{
        name: 'Sin datos',
        data: [[0, 0, 0]]
      }];
    }
    
    const height = chartHeightNumber;
    const borderColor = getCSSVariableValue('--bs-border-dashed-color');
    console.log(series_data);
    
    const options = {
      series: series_data,
      chart: {
        fontFamily: 'inherit',
        type: 'bubble',
        height: height,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bubble: {},
      },
      stroke: {
        show: false,
        width: 0,
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        type: 'numeric',
        tickAmount: 7,
        min: 0,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: true,
          height: 0,
        },
        labels: {
          show: true,
          trim: true,
          style: {
            colors: getCSSVariableValue('--bs-gray-500'),
            fontSize: '13px',
          },
        },
      },
      yaxis: {
        tickAmount: 7,
        min: 0,
        labels: {
          style: {
            colors: getCSSVariableValue('--bs-gray-500'),
            fontSize: '13px',
          },
        },
      },
      tooltip: {
        style: {
          fontSize: '12px',
        },
        x: {
          formatter: function (val: string) {
            return 'Avg: ' + val;
          },
        },
        y: {
          formatter: function (val: string) {
            return val + ' PEN';
          },
        },
        z: {
          title: 'Cantidad de venta: ',
        },
      },
      crosshairs: {
        show: true,
        position: 'front',
        stroke: {
          color: getCSSVariableValue('--bs-border-dashed-color'),
          width: 1,
          dashArray: 0,
        },
      },
      colors: [
        getCSSVariableValue('--bs-primary'),
        getCSSVariableValue('--bs-success'),
        getCSSVariableValue('--bs-warning'),
        getCSSVariableValue('--bs-danger'),
        getCSSVariableValue('--bs-info'),
        '#43CED7',
      ],
      fill: {
        opacity: 0.8,
      },
      grid: {
        borderColor: borderColor,
        strokeDashArray: 4,
        padding: {
          right: 20,
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
    };
    
    return options;
  } catch (error) {
    console.error('Error en getChart1Options:', error);
    return getDefaultChartOptions(chartHeightNumber);
  }
}

function getChart2Options(chartHeightNumber: number) {
  try {
    const data = [
      [54, 42, 75, 110, 23, 87, 50],
      [25, 38, 62, 47, 26, 46, 37],
      [15, 29, 50, 44, 55, 33, 40],
      [30, 25, 45, 35, 38, 27, 32],
      [25, 38, 62, 47, 26, 46, 37],
      [15, 29, 50, 44, 55, 33, 40],
      [30, 25, 45, 35, 38, 27, 32],
      [25, 38, 62, 47, 26, 46, 37],
      [15, 29, 50, 44, 55, 33, 40],
      [30, 25, 45, 35, 38, 27, 32],
    ];

    const height = chartHeightNumber;
    const borderColor = getCSSVariableValue('--bs-border-dashed-color');

    const options = {
      series: [
        {
          name: 'Social Campaigns',
          data: data[0],
        },
        {
          name: 'Email Newsletter',
          data: data[1],
        },
        {
          name: 'TV Campaign',
          data: data[2],
        },
        {
          name: 'Google Ads',
          data: data[3],
        },
        {
          name: 'Courses',
          data: data[4],
        },
        {
          name: 'Radio',
          data: data[5],
        },
      ],
      chart: {
        fontFamily: 'inherit',
        type: 'area',
        height: height,
        toolbar: {
          show: false,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: 'solid',
        opacity: 0.7,
      },
      stroke: {
        curve: 'smooth',
        show: true,
        width: 2,
        colors: [
          getCSSVariableValue('--bs-primary'),
          getCSSVariableValue('--bs-success'),
          getCSSVariableValue('--bs-warning'),
          getCSSVariableValue('--bs-danger'),
          getCSSVariableValue('--bs-info'),
          '#43CED7',
        ],
      },
      xaxis: {
        categories: ['1', '2', '3', '4', '5', '6', '7'],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: getCSSVariableValue('--bs-gray-500'),
            fontSize: '13px',
          },
        },
        crosshairs: {
          position: 'front',
          stroke: {
            color: getCSSVariableValue('--bs-gray-400'),
            width: 1,
            dashArray: 3,
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: getCSSVariableValue('--bs-gray-500'),
            fontSize: '13px',
          },
          formatter: function (val: number) {
            return val + '';
          },
        },
      },
      tooltip: {
        style: {
          fontSize: '12px',
        },
        x: {
          formatter: function (val: string) {
            return 'Clicks: ' + val;
          },
        },
        y: {
          formatter: function (val: string) {
            return '$' + val + 'K';
          },
        },
        z: {
          title: 'Impression: ',
        },
      },
      crosshairs: {
        show: true,
        position: 'front',
        stroke: {
          color: getCSSVariableValue('--bs-border-dashed-color'),
          width: 1,
          dashArray: 0,
        },
      },
      colors: [
        getCSSVariableValue('--bs-primary'),
        getCSSVariableValue('--bs-success'),
        getCSSVariableValue('--bs-warning'),
        getCSSVariableValue('--bs-danger'),
        getCSSVariableValue('--bs-info'),
        '#43CED7',
      ],
      markers: {
        strokeWidth: 0,
      },
      grid: {
        borderColor: borderColor,
        strokeDashArray: 4,
        padding: {
          right: 20,
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
    };
    return options;
  } catch (error) {
    console.error('Error en getChart2Options:', error);
    return getDefaultChartOptions(chartHeightNumber);
  }
}
