import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../services/user.service';
import { Observable, switchMap, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true,
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string | null | undefined): SafeResourceUrl | null {
    if (!url) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, SafeUrlPipe],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  error: string | null = null;

  activeTab: 'about' | 'address' | 'company' = 'about';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idString = params.get('id');
          if (idString) {
            const userId = +idString;
            if (isNaN(userId)) {
              this.error = 'Invalid user ID provided.';
              this.isLoading = false;
              return of(null);
            }
            this.isLoading = true;
            this.error = null;
            return this.userService.getUserById(userId);
          } else {
            this.error = 'User ID not found in URL.';
            this.isLoading = false;
            return of(null);
          }
        }),
      )
      .subscribe({
        next: (data) => {
          this.user = data;
          this.isLoading = false;
          if (!data && !this.error) {
            this.error = 'User not found.';
          }
        },
        error: (err) => {
          console.error('Error fetching user details:', err);
          this.error = 'Failed to load user details.';
          this.isLoading = false;
        },
      });
  }

  setActiveTab(tab: 'about' | 'address' | 'company'): void {
    this.activeTab = tab;
  }

  getMapUrl(lat: string | undefined, lng: string | undefined): string | null {
    if (lat && lng) {
      return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=14&output=embed`;
    }
    return null;
  }
}
