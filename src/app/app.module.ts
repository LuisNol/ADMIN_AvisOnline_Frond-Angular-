import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ClipboardModule } from 'ngx-clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './modules/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
// #fake-start#
import { FakeAPIService } from './_fake/fake-api.service';
import { ToastrModule } from 'ngx-toastr';
import { CKEditorModule } from 'ckeditor4-angular';
// #fake-end#
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthInterceptorProvider } from './core/interceptors/auth.interceptor';
import { PermissionService } from './modules/auth/services/permission.service';

function appInitializer(authService: AuthService, permissionService: PermissionService) {
  return () => {
    return new Promise<void>((resolve) => {
      // Primero cargamos el usuario
      authService.getUserByToken().subscribe({
        next: (user) => {
          if (user) {
            // Si hay usuario, cargamos los permisos
            permissionService.loadUserPermissions().subscribe({
              complete: () => resolve()
            });
          } else {
            resolve();
          }
        },
        error: (error) => {
          console.error('Error loading user:', error);
          resolve();
        }
      });
    });
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    ClipboardModule,
    // #fake-start#
    environment.isMockEnabled
      ? HttpClientInMemoryWebApiModule.forRoot(FakeAPIService, {
        passThruUnknownUrl: true,
        dataEncapsulation: false,
      })
      : [],
    // #fake-end#
    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule,
     //
     CKEditorModule,
     //
    SweetAlert2Module.forRoot(),
    ToastrModule.forRoot(),
    NgbPaginationModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService, PermissionService],
    },
    AuthInterceptorProvider,
    PermissionService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
