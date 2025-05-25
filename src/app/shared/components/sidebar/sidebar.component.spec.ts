import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  it('should create the sidebar', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should default to desktop collapsed', () => {
      component.isMobile = false;
      component.ngOnInit();
      expect(component.isSidebarCollapsed).toBeTrue();
      expect(component.isExpandedClass).toBeFalse();
      expect(component.isMobileCollapsedClass).toBeFalse();
      expect(component.isMobileOverlayActiveClass).toBeFalse();
    });

    it('should not emit on init when collapsed remains true', () => {
      component.isMobile = false;
      const emitSpy = jasmine.createSpy('emit');
      component.sidebarToggled.subscribe(emitSpy);
      component.ngOnInit();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('desktop expand/collapse', () => {
    beforeEach(() => {
      component.isMobile = false;
      component.ngOnInit();
    });

    it('expandSidebar should set collapsed false and emit', () => {
      const emitSpy = jasmine.createSpy('emit');
      component.sidebarToggled.subscribe(emitSpy);
      component.expandSidebar();
      expect(component.isSidebarCollapsed).toBeFalse();
      expect(component.isExpandedClass).toBeTrue();
      expect(emitSpy).toHaveBeenCalledWith(false);
    });

    it('collapseSidebar should set collapsed true and emit', () => {
      component.expandSidebar();
      const emitSpy = jasmine.createSpy('emit');
      component.sidebarToggled.subscribe(emitSpy);
      component.collapseSidebar();
      expect(component.isSidebarCollapsed).toBeTrue();
      expect(component.isExpandedClass).toBeFalse();
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('no emit when calling expandSidebar while already expanded=false', () => {
      component.expandSidebar();
      const emitSpy = jasmine.createSpy('emit');
      component.sidebarToggled.subscribe(emitSpy);
      component.expandSidebar();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('mobile toggleMobileMenu', () => {
    it('toggleMobileMenu should toggle visibility only when isMobile=true', () => {
      component.isMobileMenuVisible = false;
      component.isMobile = false;
      component.toggleMobileMenu();
      expect(component.isMobileMenuVisible).toBeFalse();

      component.isMobile = true;
      component.toggleMobileMenu();
      expect(component.isMobileMenuVisible).toBeTrue();

      component.toggleMobileMenu();
      expect(component.isMobileMenuVisible).toBeFalse();
    });

    it('should update host-binding flags for mobile state', () => {
      component.isMobile = true;
      component.isMobileMenuVisible = false;
      expect(component.isMobileCollapsedClass).toBeTrue();
      expect(component.isMobileOverlayActiveClass).toBeFalse();

      component.toggleMobileMenu();
      expect(component.isMobileCollapsedClass).toBeFalse();
      expect(component.isMobileOverlayActiveClass).toBeTrue();
    });
  });
});
