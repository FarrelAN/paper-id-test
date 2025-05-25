import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, of } from 'rxjs';
import { filter, map, switchMap, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    SidebarComponent,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild(SidebarComponent) private sidebarInstance?: SidebarComponent;

  public isAppSidebarCollapsed = true;
  public isMobileView = false;
  public pageTitle: string = '';

  private mobileBreakpoint = 768;
  private routerSubscription?: Subscription;
  private isBrowser: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.checkIfMobileViewForLayout();
    this.subscribeToRouteChanges();
  }

  private subscribeToRouteChanges(): void {
    if (!this.isBrowser) {
      return;
    }

    this.routerSubscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        switchMap((route) => {
          const titleFromData = route.snapshot.data?.['title'];
          if (titleFromData) {
            return route.data.pipe(map((data) => data['title']));
          }
          return of(route.snapshot.title as string | undefined);
        }),
        distinctUntilChanged(),
      )
      .subscribe((titleFromRoute?: string) => {
        this.pageTitle = titleFromRoute || 'Dashboard';
        this.cdr.detectChanges();
      });
  }

  @HostListener('window:resize')
  onAppResize(): void {
    this.checkIfMobileViewForLayout();
  }

  private checkIfMobileViewForLayout(): void {
    if (!this.isBrowser) {
      this.isMobileView = false;
      this.isAppSidebarCollapsed = true;
      return;
    }

    const previousMobileView = this.isMobileView;
    this.isMobileView = window.innerWidth <= this.mobileBreakpoint;

    if (this.isMobileView) {
      this.isAppSidebarCollapsed = true;
    } else if (this.sidebarInstance?.isMobileMenuVisible) {
      this.sidebarInstance.toggleMobileMenu();
    }

    if (previousMobileView !== this.isMobileView) {
      this.cdr.detectChanges();
    }
  }

  onSidebarToggle(isCollapsed: boolean): void {
    if (this.isBrowser && !this.isMobileView) {
      this.isAppSidebarCollapsed = isCollapsed;
    }
  }

  public closeMobileMenu(): void {
    if (this.isMobileView && this.sidebarInstance?.isMobileMenuVisible) {
      this.sidebarInstance.toggleMobileMenu();
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}
