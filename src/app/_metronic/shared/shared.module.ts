import {NgModule} from '@angular/core';
import {KeeniconComponent} from './keenicon/keenicon.component';
import {CommonModule} from "@angular/common";
import { AlertComponent } from '../../shared/components/alert/alert.component';


@NgModule({
  declarations: [
    KeeniconComponent,
    AlertComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    KeeniconComponent,
    AlertComponent
  ]
})
export class SharedModule {
}
