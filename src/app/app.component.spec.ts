import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import {
  PLATFORM_ID,
  NO_ERRORS_SCHEMA,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let events$: Subject<any>;

  beforeEach(async () => {
    events$ = new Subject<any>();
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: ActivatedRoute,
          useValue: {
            firstChild: null,
            outlet: 'primary',
            snapshot: { data: {}, title: undefined },
            data: of({}),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial default states', () => {
    expect(component.isAppSidebarCollapsed).toBeTrue();
    expect(component.isMobileView).toBeFalse();
    expect(component.pageTitle).toBe('');
  });

  describe('subscribeToRouteChanges', () => {
    it('updates pageTitle on NavigationEnd and calls detectChanges', fakeAsync(() => {
      const cdrSpy = spyOn((component as any).cdr, 'detectChanges');
      spyOnProperty(router, 'events', 'get').and.returnValue(events$);

      component['subscribeToRouteChanges']();

      events$.next(new NavigationEnd(1, '/test', '/test'));
      tick();

      expect(component.pageTitle).toBe('Dashboard');
      expect(cdrSpy).toHaveBeenCalled();
    }));
  });

  describe('onAppResize', () => {
    it('calls checkIfMobileViewForLayout', () => {
      spyOn<any>(component, 'checkIfMobileViewForLayout');
      component.onAppResize();
      expect(component['checkIfMobileViewForLayout']).toHaveBeenCalled();
    });
  });

  describe('checkIfMobileViewForLayout', () => {
    it('sets mobile view when width <= breakpoint', () => {
      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(500);
      component['checkIfMobileViewForLayout']();
      expect(component.isMobileView).toBeTrue();
      expect(component.isAppSidebarCollapsed).toBeTrue();
    });

    it('handles desktop view and toggles sidebarInstance if needed', () => {
      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1024);
      component['sidebarInstance'] = {
        isMobileMenuVisible: true,
        toggleMobileMenu: jasmine.createSpy(),
      } as any;
      component['checkIfMobileViewForLayout']();
      expect(component.isMobileView).toBeFalse();
      expect(
        (component['sidebarInstance'] as any).toggleMobileMenu,
      ).toHaveBeenCalled();
    });
  });

  describe('onSidebarToggle', () => {
    it('toggles collapse when not mobile', () => {
      component.isMobileView = false;
      component.isAppSidebarCollapsed = false;
      component.onSidebarToggle(true);
      expect(component.isAppSidebarCollapsed).toBeTrue();
    });

    it('does nothing when mobile', () => {
      component.isMobileView = true;
      component.isAppSidebarCollapsed = false;
      component.onSidebarToggle(true);
      expect(component.isAppSidebarCollapsed).toBeFalse();
    });
  });

  describe('closeMobileMenu', () => {
    it('toggles sidebarInstance when mobile and visible', () => {
      component.isMobileView = true;
      component['sidebarInstance'] = {
        isMobileMenuVisible: true,
        toggleMobileMenu: jasmine.createSpy(),
      } as any;
      component.closeMobileMenu();
      expect(
        (component['sidebarInstance'] as any).toggleMobileMenu,
      ).toHaveBeenCalled();
    });

    it('does nothing when not mobile', () => {
      component.isMobileView = false;
      component['sidebarInstance'] = {
        isMobileMenuVisible: true,
        toggleMobileMenu: jasmine.createSpy(),
      } as any;
      component.closeMobileMenu();
      expect(
        (component['sidebarInstance'] as any).toggleMobileMenu,
      ).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('unsubscribes routerSubscription', () => {
      const sub = jasmine.createSpyObj('sub', ['unsubscribe']);
      component['routerSubscription'] = sub as any;
      component.ngOnDestroy();
      expect(sub.unsubscribe).toHaveBeenCalled();
    });
  });
});
