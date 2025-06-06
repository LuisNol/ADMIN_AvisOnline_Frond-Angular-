import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGoogleService } from '../auth-google.service';
import { PermissionService } from '../modules/auth/services/permission.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(
    private authGoogleService: AuthGoogleService,
    private permissionService: PermissionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const stored = this.authGoogleService.storeCredentials();
    if (stored) {
      this.permissionService.loadUserPermissions().subscribe(
        () => this.router.navigate(['/dashboard']),
        () => this.router.navigate(['/dashboard'])
      );
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  showData(): void {
    const data = JSON.stringify(this.authGoogleService.getProfile());
    console.log(data);
  }

  logOut(): void {
    this.authGoogleService.logout();
    this.router.navigate(['/login']);
  }

}
