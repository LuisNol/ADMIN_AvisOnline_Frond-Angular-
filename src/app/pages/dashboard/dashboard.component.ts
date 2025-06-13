import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SalesService } from 'src/app/modules/sales/service/sales.service';
import { getSafeArray, getSafeValue, initChartSafely, isValidObject } from './dashboard-helpers';
import { PermissionService } from 'src/app/modules/auth/services/permission.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

declare var KTUtil:any;
declare var KTThemeMode:any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;

  meses:any = [];
  year_current:string = '';
  month_current:string = '';
  year_1:string = '';
  month_1:string = '';
  year_2:string = '';
  month_2:string = '';
  year_3:string = '';
  year_4:string = '';
  month_4:string = '';
  year_5:string = '';
  month_5:string = '';

  isLoading$:any;
  percentage_sale_for_country:number = 0;
  sales_for_year_for_country:any = null;

  report_sale_for_week:any;

  discount_weeks:any = [];
  discount_percentage_v:number = 0;
  discount_total_week:number = 0;

  report_sale_form_month:any;

  discount_for_list_year:any = [];
  cupone_for_list_year:any = [];

  report_discount_for_year:any;
  selected_type_discount:number = 1;
  total_uso_canje_discount:number = 0;

  report_sale_categorie_details:any;
  product_most_sales:any = [];
  sale_month_categories:any = [];
  categorie_selected:number = 0;
  categorie_details:any = [];

  report_sale_brands:any;
  
  // Controlar el acceso limitado para usuarios con manage-own-products
  hasFullAccess: boolean = false;
  hasLimitedAccess: boolean = false;
  limitedAccessMessage: string = '';
  
  constructor(
   public salesService: SalesService,
   private permissionService: PermissionService,
   private router: Router,
   private toastr: ToastrService
  ) {}

  async openModal() {
    return await this.modalComponent.open();
  }

  ngOnInit(): void {
    // Verificar permisos antes de cargar el dashboard
    const hasManageProducts = this.permissionService.hasPermission('manage-products');
    const isAdmin = this.permissionService.hasRole('Admin');
    const hasManageOwnProducts = this.permissionService.hasPermission('manage-own-products');
    
    this.hasFullAccess = isAdmin || hasManageProducts;
    this.hasLimitedAccess = !this.hasFullAccess && hasManageOwnProducts;
    
    if (!this.hasFullAccess && !this.hasLimitedAccess) {
      this.toastr.error('No tienes permisos para acceder al dashboard', 'Error de permisos');
      this.router.navigate(['/products/list']);
      return;
    }
    
   this.isLoading$ = this.salesService.isLoading$;
   
   this.salesService.configAllReport().subscribe({
      next: (resp: any) => {
        console.log(resp);
        
        // Verificar si tiene acceso limitado (desde el backend)
        if (resp.limited_access) {
          this.hasLimitedAccess = true;
          this.hasFullAccess = false;
          this.limitedAccessMessage = resp.message || 'Acceso limitado al dashboard';
          this.toastr.info(this.limitedAccessMessage);
        }
        
        // meses , año y mes
        this.meses = getSafeArray(resp.meses);
        this.year_current = getSafeValue(resp, 'year', '2025');
        this.month_current = getSafeValue(resp, 'month', '01');
        // 
        this.year_1 = getSafeValue(resp, 'year', '2025');
        this.month_1 = getSafeValue(resp, 'month', '01');
        this.year_2 = getSafeValue(resp, 'year', '2025');
        this.month_2 = getSafeValue(resp, 'month', '01');
        this.year_3 = getSafeValue(resp, 'year', '2025');
        this.year_4 = getSafeValue(resp, 'year', '2025');
        this.month_4 = getSafeValue(resp, 'month', '01');
        this.year_5 = getSafeValue(resp, 'year', '2025');
        this.month_5 = getSafeValue(resp, 'month', '01');
        
        // Solo cargar informes si tiene acceso completo
        if (this.hasFullAccess) {
          this.loadAllReports();
        }
      },
      error: (error) => {
        console.error('Error al cargar configuración del dashboard:', error);
        if (error.status === 403) {
          this.toastr.error('No tienes permisos para acceder al dashboard', 'Error de permisos');
          this.router.navigate(['/products/list']);
        }
      }
   });
  }
  
  // Método para cargar todos los informes
  loadAllReports() {
    this.reportSaleForCountry();
    this.reportSaleForWeek();
    this.reportSaleForDiscountWeek();
    this.reportSaleForMonth();
    this.reportSaleForYearDiscount();
    this.reportSaleForCategorieDetail();
    this.reportSaleForBrands();
  }

  reportSaleForCountry(){
    // Skip si no tiene acceso completo
    if (!this.hasFullAccess) return;
    
   let data = {
      year: this.year_1,
      month: this.month_1,
   }
   this.sales_for_year_for_country = null;
   this.salesService.reportSaleForCountry(data).subscribe({
      next: (resp:any) => {
        console.log(resp);
        var categories_labels:any = [];
        var series_data:any = [];
        this.percentage_sale_for_country = resp.percentageV;
        this.sales_for_year_for_country = resp.sales_for_year;
        resp.sales_for_country.forEach((element:any) => {
           categories_labels.push(element.country_region);
           series_data.push(element.total_sales);
        });
        var KTChartsWidget27 = function() {
           var e:any = {
                   self: null,
                   rendered: !1
               },
               t = function(e:any) {
                   var t = document.getElementById("kt_charts_widget_27");
                   if (t) {
                       var a = KTUtil.getCssVariableValue("--bs-gray-800"),
                           l = KTUtil.getCssVariableValue("--bs-border-dashed-color"),
                           r = {
                               series: [{
                                   name: "Sessions",
                                   data: series_data,
                               }],
                               chart: {
                                   fontFamily: "inherit",
                                   type: "bar",
                                   height: 350,
                                   toolbar: {
                                       show: !1
                                   }
                               },
                               plotOptions: {
                                   bar: {
                                       borderRadius: 8,
                                       horizontal: !0,
                                       distributed: !0,
                                       barHeight: 50,
                                       dataLabels: {
                                           position: "bottom"
                                       }
                                   }
                               },
                               dataLabels: {
                                   enabled: !0,
                                   textAnchor: "start",
                                   offsetX: 0,
                                   // formatter: function(e:any, t:any) {
                                   //     e *= 1e3;
                                   //     return wNumb({
                                   //         thousand: ","
                                   //     }).to(e)
                                   // },
                                   style: {
                                       fontSize: "14px",
                                       fontWeight: "600",
                                       align: "left"
                                   }
                               },
                               legend: {
                                   show: !1
                               },
                               colors: ["#3E97FF", "#F1416C", "#50CD89", "#FFC700", "#7239EA"],
                               xaxis: {
                                   categories: categories_labels,
                                   labels: {
                                      //  formatter: function(e:any) {
                                      //      return e + "K"
                                      //  },
                                       style: {
                                           colors: a,
                                           fontSize: "14px",
                                           fontWeight: "600",
                                           align: "left"
                                       }
                                   },
                                   axisBorder: {
                                       show: !1
                                   }
                               },
                               yaxis: {
                                   labels: {
                                       formatter: function(et:any, t:any) {
                                            let result = parseInt((100 * et / 18)+"");
                                           return Number.isInteger(et) ? et + " - " + result.toString() + "%" : et
                                       },
                                       style: {
                                           colors: a,
                                           fontSize: "14px",
                                           fontWeight: "600"
                                       },
                                       offsetY: 2,
                                       align: "left"
                                   }
                               },
                               grid: {
                                   borderColor: l,
                                   xaxis: {
                                       lines: {
                                           show: !0
                                       }
                                   },
                                   yaxis: {
                                       lines: {
                                           show: !1
                                       }
                                   },
                                   strokeDashArray: 4
                               },
                               tooltip: {
                                   style: {
                                       fontSize: "12px"
                                   },
                                   y: {
                                       formatter: function(e:any) {
                                           return e
                                       }
                                   }
                               }
                           };
                       e.self = new ApexCharts(t, r), setTimeout((function() {
                           e.self.render(), e.rendered = !0
                       }), 200)
                   }
               };
           return {
               init: function() {
                   t(e), KTThemeMode.on("kt.thememode.change", (function() {
                       e.rendered && e.self.destroy(), t(e)
                   }))
               }
           }
        }();
        setTimeout(() => {
           KTUtil.onDOMContentLoaded((function() {
              KTChartsWidget27.init()
           }));
        }, 50);

      },
      error: (error) => {
        console.error('Error al cargar reporte de ventas por país:', error);
      }
   });
  }

  reportSaleForWeek(){

   this.salesService.reportSaleForWeek().subscribe((resp:any) => {
      // console.log(resp);
      this.report_sale_for_week = resp;
   })
  }

  reportSaleForDiscountWeek(){

   this.salesService.reportSaleForDiscountWeek().subscribe((resp:any) => {
      console.log(resp);

      this.discount_weeks = resp.discount_for_days;
      this.discount_percentage_v = resp.porcentageV;
      this.discount_total_week = resp.sales_week_discounts;

      var series_data:any = [];
      var categories_data:any = [];
      this.discount_weeks.forEach((element:any) => {
         series_data.push(element.percentage);
         categories_data.push(element.date);
      });
      let KTCardsWidget6 = {
         init: function () {
           var e = document.getElementById("kt_card_widget_6_chart");
           if (e) {
                 var t = parseInt(KTUtil.css(e, "height")),
                   a = KTUtil.getCssVariableValue("--bs-gray-500"),
                   l = KTUtil.getCssVariableValue("--bs-border-dashed-color"),
                   r = KTUtil.getCssVariableValue("--bs-primary"),
                   o = KTUtil.getCssVariableValue("--bs-gray-300"),
                   i = new ApexCharts(e, {
                       series: [{
                         name: "Discounts",
                         data: series_data,
                       }],
                       chart: {
                         fontFamily: "inherit",
                         type: "bar",
                         height: t,
                         toolbar: {
                             show: !1
                         },
                         sparkline: {
                             enabled: !0
                         }
                       },
                       plotOptions: {
                         bar: {
                             horizontal: !1,
                             columnWidth: ["55%"],
                             borderRadius: 6
                         }
                       },
                       legend: {
                         show: !1
                       },
                       dataLabels: {
                         enabled: !1
                       },
                       stroke: {
                         show: !0,
                         width: 9,
                         colors: ["transparent"]
                       },
                       xaxis: {
                        categories: categories_data,
                        axisBorder: {
                           show: !1
                        },
                         axisTicks: {
                             show: !1,
                             tickPlacement: "between"
                         },
                         labels: {
                             show: !1,
                             style: {
                               colors: a,
                               fontSize: "12px"
                             }
                         },
                         crosshairs: {
                             show: !1
                         }
                       },
                       yaxis: {
                         labels: {
                             show: !1,
                             style: {
                               colors: a,
                               fontSize: "12px"
                             }
                         }
                       },
                       fill: {
                         type: "solid"
                       },
                       states: {
                         normal: {
                             filter: {
                               type: "none",
                               value: 0
                             }
                         },
                         hover: {
                             filter: {
                               type: "none",
                               value: 0
                             }
                         },
                         active: {
                             allowMultipleDataPointsSelection: !1,
                             filter: {
                               type: "none",
                               value: 0
                             }
                         }
                       },
                       tooltip: {
                         style: {
                             fontSize: "12px"
                         },
                         x: {
                             formatter: function (e:any) {
                               return e;//"Feb: " 
                             }
                         },
                         y: {
                             formatter: function (e:any) {
                               return e + "%"
                             }
                         }
                       },
                       colors: [r, o],
                       grid: {
                         padding: {
                             left: 10,
                             right: 10
                         },
                         borderColor: l,
                         strokeDashArray: 4,
                         yaxis: {
                             lines: {
                               show: !0
                             }
                         }
                       }
                   });
                 setTimeout((function () {
                   i.render()
                 }), 300)
           }
         }
       };
       KTUtil.onDOMContentLoaded((function () {
         KTCardsWidget6.init()
       }))
   })
  }

  reportSaleForMonth(){
   let data = {
      year: this.year_2,
      month: this.month_2,
   }
   this.report_sale_form_month = null;
   this.salesService.reportSaleForMonth(data).subscribe((resp:any) => {
      console.log(resp);
      var categories_labels:any = [];
      var series_data:any = [];
      this.report_sale_form_month = resp;
      this.report_sale_form_month.sales_for_day_of_month.forEach((element:any) => {
         categories_labels.push(element.date_format_day);
         series_data.push(element.sales_total);
      });
      var max_data = Math.max(...series_data);
      var min_data = Math.min(...series_data);
      console.log(max_data,min_data);
      var KTChartsWidget3 = function () {
         var e:any = {
               self: null,
               rendered: !1
            },
            t = function (e:any) {
               var t = document.getElementById("kt_charts_widget_3");
               if (t) {
                  var a = parseInt(KTUtil.css(t, "height")),
                     l = KTUtil.getCssVariableValue("--bs-gray-500"),
                     r = KTUtil.getCssVariableValue("--bs-border-dashed-color"),
                     o = KTUtil.getCssVariableValue("--bs-success"),
                     i = {
                        series: [{
                           name: "Sales",
                           data: series_data,
                        }],
                        chart: {
                           fontFamily: "inherit",
                           type: "area",
                           height: a,
                           toolbar: {
                              show: !1
                           }
                        },
                        plotOptions: {},
                        legend: {
                           show: !1
                        },
                        dataLabels: {
                           enabled: !1
                        },
                        fill: {
                           type: "gradient",
                           gradient: {
                              shadeIntensity: 1,
                              opacityFrom: .4,
                              opacityTo: 0,
                              stops: [0, 80, 100]
                           }
                        },
                        stroke: {
                           curve: "smooth",
                           show: !0,
                           width: 3,
                           colors: [o]
                        },
                        xaxis: {
                           categories: categories_labels,
                           axisBorder: {
                              show: !1
                           },
                           axisTicks: {
                              show: !1
                           },
                           tickAmount: 6,
                           labels: {
                              rotate: 0,
                              rotateAlways: !0,
                              style: {
                                 colors: l,
                                 fontSize: "12px"
                              }
                           },
                           crosshairs: {
                              position: "front",
                              stroke: {
                                 color: o,
                                 width: 1,
                                 dashArray: 3
                              }
                           },
                           tooltip: {
                              enabled: !0,
                              formatter: void 0,
                              offsetY: 0,
                              style: {
                                 fontSize: "12px"
                              }
                           }
                        },
                        yaxis: {
                           tickAmount: 4,
                           max: max_data,
                           min: min_data,
                           labels: {
                              style: {
                                 colors: l,
                                 fontSize: "12px"
                              },
                              formatter: function (e:any) {
                                 return e + " PEN"; //+ "K"
                              }
                           }
                        },
                        states: {
                           normal: {
                              filter: {
                                 type: "none",
                                 value: 0
                              }
                           },
                           hover: {
                              filter: {
                                 type: "none",
                                 value: 0
                              }
                           },
                           active: {
                              allowMultipleDataPointsSelection: !1,
                              filter: {
                                 type: "none",
                                 value: 0
                              }
                           }
                        },
                        tooltip: {
                           style: {
                              fontSize: "12px"
                           },
                           y: {
                              formatter: function (e:any) {
                                 return e + " PEN";; //+ "K"
                              }
                           }
                        },
                        colors: [KTUtil.getCssVariableValue("--bs-success")],
                        grid: {
                           borderColor: r,
                           strokeDashArray: 4,
                           yaxis: {
                              lines: {
                                 show: !0
                              }
                           }
                        },
                        markers: {
                           strokeColor: o,
                           strokeWidth: 3
                        }
                     };
                  e.self = new ApexCharts(t, i), setTimeout((function () {
                     e.self.render(), e.rendered = !0
                  }), 200)
               }
            };
         return {
            init: function () {
               t(e), KTThemeMode.on("kt.thememode.change", (function () {
                  e.rendered && e.self.destroy(), t(e)
               }))
            }
         }
       }();
   
       setTimeout(() => {
         KTUtil.onDOMContentLoaded((function () {
               KTChartsWidget3.init()
         }));
      }, 50);

   })
  }

  DiscountCuponR($event:any){
   console.log($event);
   this.discount_for_list_year = $event.discount;
   this.cupone_for_list_year = $event.cupone;
  }

  reportSaleForYearDiscount(){
   let data = {
      year: this.year_3,
   }
   this.report_discount_for_year = null;
   this.salesService.reportSaleForYearDiscount(data).subscribe((resp:any) => {
      console.log(resp);
      // var categories_labels:any = [];
      // var series_data:any = [];
      this.report_discount_for_year = resp;
      // this.report_discount_for_year.canje_cupone_year.forEach((element:any) => {
      //    categories_labels.push(element.cupone);
      //    series_data.push(element.count_total);
      // });
      setTimeout(() => {
         this.selectedTypeDiscount(1);
      }, 25);
      // var max_data = Math.max(...series_data);
      // var min_data = Math.min(...series_data);
      // console.log(max_data,min_data);

   })
  }

  selectedTypeDiscount(numero:number){
   this.selected_type_discount = numero;

   var categories_labels:any = [];
   var series_data:any = [];
   var title_series:string = '';
   var title_format:string = '';
   let BACKUP = this.report_discount_for_year;
   this.report_discount_for_year = null;
   setTimeout(() => {
      this.isLoadingView();
      this.report_discount_for_year = BACKUP;
      if(this.selected_type_discount == 1){
         this.total_uso_canje_discount = 0;
         this.report_discount_for_year.canje_cupone_year.forEach((element:any) => {
            categories_labels.push(element.cupone);
            series_data.push(element.count_total);
            this.total_uso_canje_discount += element.count_total;
         });
         title_series = 'Canje por Cupon'
         title_format = "Canje"
      }
   
      if(this.selected_type_discount == 2){
         this.total_uso_canje_discount = 0;
         this.report_discount_for_year.uso_discount_year.forEach((element:any) => {
            categories_labels.push(element.code_discount);
            series_data.push(element.count_total);
            this.total_uso_canje_discount += element.count_total;
         });
         title_series = "Uso por campaña"
         title_format = "Uso"
      }
   
      this.graficDiscountCupone(series_data,categories_labels,title_series,title_format);
   }, 50);
  }
  isLoadingView(){
   this.salesService.isLoadingSubject.next(true);
   setTimeout(() => {
     this.salesService.isLoadingSubject.next(false);
   }, 50);
 }
  graficDiscountCupone(series_data:any,categories_labels:any,title_series:string,title_format:string){
   var KTChartsWidget10Chart1 = function () {
      var e:any = {
            self: null,
            rendered: !1
         },
         t = function (e:any) {
            var t = document.getElementById("kt_charts_widget_10_chart_1");
            if (t) {
               var a = parseInt(KTUtil.css(t, "height")),
                  l = KTUtil.getCssVariableValue("--bs-gray-900"),
                  r = KTUtil.getCssVariableValue("--bs-border-dashed-color"),
                  o = {
                     series: [{
                        name: title_series,//"Canje por Cupon",
                        data: series_data,
                     }],
                     chart: {
                        fontFamily: "inherit",
                        type: "bar",
                        height: a,
                        toolbar: {
                           show: !1
                        }
                     },
                     plotOptions: {
                        bar: {
                           horizontal: !1,
                           columnWidth: ["28%"],
                           borderRadius: 5,
                           dataLabels: {
                              position: "top"
                           },
                           startingShape: "flat"
                        }
                     },
                     legend: {
                        show: !1
                     },
                     dataLabels: {
                        enabled: !0,
                        offsetY: -28,
                        style: {
                           fontSize: "13px",
                           colors: [l]
                        },
                        formatter: function (e:any) {
                           return e
                        }
                     },
                     stroke: {
                        show: !0,
                        width: 2,
                        colors: ["transparent"]
                     },
                     xaxis: {
                        categories: categories_labels,
                        axisBorder: {
                           show: !1
                        },
                        axisTicks: {
                           show: !1
                        },
                        labels: {
                           style: {
                              colors: KTUtil.getCssVariableValue("--bs-gray-500"),
                              fontSize: "13px"
                           }
                        },
                        crosshairs: {
                           fill: {
                              gradient: {
                                 opacityFrom: 0,
                                 opacityTo: 0
                              }
                           }
                        }
                     },
                     yaxis: {
                        labels: {
                           style: {
                              colors: KTUtil.getCssVariableValue("--bs-gray-500"),
                              fontSize: "13px"
                           },
                           // formatter: function (e:any) {
                           //    return e + "H"
                           // }
                        }
                     },
                     fill: {
                        opacity: 1
                     },
                     states: {
                        normal: {
                           filter: {
                              type: "none",
                              value: 0
                           }
                        },
                        hover: {
                           filter: {
                              type: "none",
                              value: 0
                           }
                        },
                        active: {
                           allowMultipleDataPointsSelection: !1,
                           filter: {
                              type: "none",
                              value: 0
                           }
                        }
                     },
                     tooltip: {
                        style: {
                           fontSize: "12px"
                        },
                        y: {
                           formatter: function (e:any) {
                              return +e + " "+title_format//" Canje"
                           }
                        }
                     },
                     colors: [KTUtil.getCssVariableValue("--bs-warning"), KTUtil.getCssVariableValue("--bs-warning-light")],
                     grid: {
                        borderColor: r,
                        strokeDashArray: 4,
                        yaxis: {
                           lines: {
                              show: !0
                           }
                        }
                     }
                  };
               e.self = new ApexCharts(t, o), setTimeout((function () {
                  e.self.render(), e.rendered = !0
               }), 200)
            }
         };
      return {
         init: function () {
            t(e), KTThemeMode.on("kt.thememode.change", (function () {
               e.rendered && e.self.destroy(), t(e)
            }))
         }
      }
   }();

   
   setTimeout(() => {
       KTUtil.onDOMContentLoaded((function () {
          KTChartsWidget10Chart1.init()
       }));
   }, 50);
  }

  reportSaleForCategorieDetail(){
   let data = {
      year: this.year_4,
      month: this.month_4,
   }
   this.product_most_sales = [];
   this.sale_month_categories = [];
   this.categorie_selected = 0;
   this.categorie_details = [];
   // this.report_sale_categorie_details = null;
   this.salesService.reportSaleForCategorieDetail(data).subscribe((resp:any) => {
      console.log(resp);
      this.product_most_sales = getSafeArray(resp?.product_most_sales);
      this.sale_month_categories = getSafeArray(resp?.sale_month_categories);
      // this.report_sale_categorie_details = resp;
      
      // Solo intentamos seleccionar una categoría si hay datos
      if (this.sale_month_categories && this.sale_month_categories.length > 0) {
        this.categorie_selected = getSafeValue(this.sale_month_categories[0], 'categorie_id', 0);
        setTimeout(() => {
          this.selectedCategorie(this.sale_month_categories[0]);
          this.isLoadingView();
        }, 50);
      }
   })
  }

  selectedCategorie(sale_month_categ:any){
    if (!isValidObject(sale_month_categ)) {
      this.categorie_details = [];
      return;
    }
    
    this.categorie_selected = getSafeValue(sale_month_categ, 'categorie_id', 0);
    const DATA = this.product_most_sales?.find((item:any) => 
      getSafeValue(item, 'categorie_id', 0) == this.categorie_selected
    );
    
    this.categorie_details = getSafeValue(DATA, 'products', []);
  }

  reportSaleForBrands(){
   let data = {
      year: this.year_5,
      month: this.month_5,
   }
   this.report_sale_brands = null;
   this.salesService.reportSaleForBrands(data).subscribe((resp:any) => {
      console.log(resp);
      this.report_sale_brands = resp;

      let categorie_labels:any = [];
      var series_data:any = [];

      const salesForBrand = getSafeArray(resp?.sales_for_brand);
      salesForBrand.forEach((element:any) => {
         categorie_labels.push(getSafeValue(element, 'brand_name', 'Sin marca'));
         series_data.push(getSafeValue(element, 'quantity_total', 0));
      });

      // Si no hay datos, crear un valor por defecto para evitar errores
      if (categorie_labels.length === 0) {
        categorie_labels = ['Sin datos'];
        series_data = [0];
      }

      var KTChartsWidget22 = function () {
         var e = function (e:any, t:any, a:any, l:any) {
            var r = document.querySelector(t);
            if (r) {
               parseInt(KTUtil.css(r, "height"));
               var o = {
                     series: series_data,
                     chart: {
                        fontFamily: "inherit",
                        type: "donut",
                        width: 250
                     },
                     plotOptions: {
                        pie: {
                           donut: {
                              size: "50%",
                              labels: {
                                 value: {
                                    fontSize: "10px"
                                 }
                              }
                           }
                        }
                     },
                     colors: [KTUtil.getCssVariableValue("--bs-info"), KTUtil.getCssVariableValue("--bs-success"), KTUtil.getCssVariableValue("--bs-primary"), KTUtil.getCssVariableValue("--bs-danger"),
                     '#7fffd4','#87ceeb','#4169e1','#3cb371','#808000','#008080','#fff8dc',
                     '#bc8f8f','#a0522d','#cd853f','#b8860b','#2f4f4f','#d2b48c'],
                     stroke: {
                        width: 0
                     },
                     labels: categorie_labels,
                     legend: {
                        show: !1
                     },
                     fill: {
                        type: "false"
                     }
                  };
                  
               try {
                  var i = new ApexCharts(r, o),
                    s:any = !1,
                    n = document.querySelector(e);
                  
                  if (n && l === true) {
                    i.render();
                    s = !0;
                  }
                  
                  if (n) {
                    n.addEventListener("shown.bs.tab", (function (e:any) {
                      if (s === false) {
                        i.render();
                        s = !0;
                      }
                    }));
                  }
               } catch (error) {
                  console.error("Error al renderizar gráfico:", error);
               }
            }
         };
         return {
            init: function () {
               try {
                 e("#kt_chart_widgets_22_tab_1", "#kt_chart_widgets_22_chart_1", [20, 100, 15, 25], !0);
               } catch (error) {
                 console.error("Error al inicializar gráfico:", error);
               }
            }
         }
      }();

      setTimeout(() => {
         try {
           if (typeof KTUtil !== 'undefined' && KTUtil.onDOMContentLoaded) {
             KTUtil.onDOMContentLoaded((function () {
               if (typeof KTChartsWidget22 !== 'undefined' && KTChartsWidget22.init) {
                 KTChartsWidget22.init();
               }
             }));
           }
         } catch (error) {
           console.error("Error al inicializar evento DOM:", error);
         }
      }, 50);

      let categorie_labels_brands:any = [];
      let series_data_brands:any = [];


      this.report_sale_brands.sales_for_brand.forEach((element:any) => {
         categorie_labels_brands.push(element.brand_name);
         series_data_brands.push(element.brand_total);
      });

      var KTChartsWidget18 = function () {
         var e:any = {
               self: null,
               rendered: !1
            },
            t = function (e:any) {
               var t = document.getElementById("kt_charts_widget_18_chart");
               if (t) {
                  var a = parseInt(KTUtil.css(t, "height")),
                     l = KTUtil.getCssVariableValue("--bs-gray-900"),
                     r = KTUtil.getCssVariableValue("--bs-border-dashed-color"),
                     o = {
                        series: [{
                           name: "Ventas por marcas",
                           data: series_data_brands//[54, 42, 75, 110, 23, 87, 50]
                        }],
                        chart: {
                           fontFamily: "inherit",
                           type: "bar",
                           height: a,
                           toolbar: {
                              show: !1
                           }
                        },
                        plotOptions: {
                           bar: {
                              horizontal: !1,
                              columnWidth: ["28%"],
                              borderRadius: 5,
                              dataLabels: {
                                 position: "top"
                              },
                              startingShape: "flat"
                           }
                        },
                        legend: {
                           show: !1
                        },
                        dataLabels: {
                           enabled: !0,
                           offsetY: -28,
                           style: {
                              fontSize: "13px",
                              colors: [l]
                           },
                           formatter: function (e:any) {
                              return e
                           }
                        },
                        stroke: {
                           show: !0,
                           width: 2,
                           colors: ["transparent"]
                        },
                        xaxis: {
                           categories: categorie_labels_brands,
                           axisBorder: {
                              show: !1
                           },
                           axisTicks: {
                              show: !1
                           },
                           labels: {
                              style: {
                                 colors: KTUtil.getCssVariableValue("--bs-gray-500"),
                                 fontSize: "13px"
                              }
                           },
                           crosshairs: {
                              fill: {
                                 gradient: {
                                    opacityFrom: 0,
                                    opacityTo: 0
                                 }
                              }
                           }
                        },
                        yaxis: {
                           labels: {
                              style: {
                                 colors: KTUtil.getCssVariableValue("--bs-gray-500"),
                                 fontSize: "13px"
                              },
                              formatter: function (e:any) {
                                 return e ;//+ "H"
                              }
                           }
                        },
                        fill: {
                           opacity: 1
                        },
                        states: {
                           normal: {
                              filter: {
                                 type: "none",
                                 value: 0
                              }
                           },
                           hover: {
                              filter: {
                                 type: "none",
                                 value: 0
                              }
                           },
                           active: {
                              allowMultipleDataPointsSelection: !1,
                              filter: {
                                 type: "none",
                                 value: 0
                              }
                           }
                        },
                        tooltip: {
                           style: {
                              fontSize: "12px"
                           },
                           y: {
                              formatter: function (e:any) {
                                 return +e + " PEN"
                              }
                           }
                        },
                        colors: [KTUtil.getCssVariableValue("--bs-primary"), KTUtil.getCssVariableValue("--bs-primary-light")],
                        grid: {
                           borderColor: r,
                           strokeDashArray: 4,
                           yaxis: {
                              lines: {
                                 show: !0
                              }
                           }
                        }
                     };
                  e.self = new ApexCharts(t, o), setTimeout((function () {
                     e.self.render(), e.rendered = !0
                  }), 200)
               }
            };
         return {
            init: function () {
               t(e), KTThemeMode.on("kt.thememode.change", (function () {
                  e.rendered && e.self.destroy(), t(e)
               }))
            }
         }
      }();
      
      setTimeout(() => {
         KTUtil.onDOMContentLoaded((function () {
            KTChartsWidget18.init()
         }));
      }, 50);

   })
  }

  getExpressionCss(i:number){
   return i % 2 === 0 ? 'odd:bg-light-success' : 'odd:bg-light-primary';
  }
}
