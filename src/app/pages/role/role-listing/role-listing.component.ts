import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Observable } from 'rxjs';
import { DataTablesResponse, IRoleModel, RoleService } from 'src/app/_fake/services/role.service';
import { SweetAlertOptions } from 'sweetalert2';

@Component({
  selector: 'app-role-listing',
  templateUrl: './role-listing.component.html',
  styleUrls: ['./role-listing.component.scss']
})
export class RoleListingComponent implements OnInit, OnDestroy {

  roles$: Observable<DataTablesResponse>;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  constructor(private apiService: RoleService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.roles$ = this.apiService.getRoles();
  }

  ngOnDestroy(): void {
  }
}
