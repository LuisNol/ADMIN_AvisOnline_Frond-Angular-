import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CrudTableComponent } from './crud-table.component';

@NgModule({
  declarations: [CrudTableComponent],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [CrudTableComponent]
})
export class CrudTableModule { } 