// src/app/user-list/user-list.component.spec.ts
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService, User } from '../../services/user.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ElementRef } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserListComponent', () => {
  let fixture: ComponentFixture<UserListComponent>;
  let component: UserListComponent;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let elementRef: ElementRef;

  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Alice',
      email: 'a@x.com',
      username: 'alice',
      website: 'alice.com',
      address: {
        street: '',
        suite: '',
        city: '',
        zipcode: '',
        geo: { lat: '', lng: '' },
      },
      phone: '',
      company: { name: '', catchPhrase: '', bs: '' },
    },
    {
      id: 2,
      name: 'Bob',
      email: 'b@x.com',
      username: 'bob',
      website: 'bob.com',
      address: {
        street: '',
        suite: '',
        city: '',
        zipcode: '',
        geo: { lat: '', lng: '' },
      },
      phone: '',
      company: { name: '', catchPhrase: '', bs: '' },
    },
    {
      id: 3,
      name: 'Cara',
      email: 'c@x.com',
      username: 'cara',
      website: 'cara.com',
      address: {
        street: '',
        suite: '',
        city: '',
        zipcode: '',
        geo: { lat: '', lng: '' },
      },
      phone: '',
      company: { name: '', catchPhrase: '', bs: '' },
    },
  ];

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    elementRef = new ElementRef(document.createElement('div'));

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ElementRef, useValue: elementRef },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  it('should create and start loading', () => {
    expect(component).toBeTruthy();
    expect(component.isLoading).toBeTrue();
  });

  describe('fetchUsers()', () => {
    it('loads users on success', fakeAsync(() => {
      userServiceSpy.getUsers.and.returnValue(of(mockUsers));
      component.fetchUsers();
      tick();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
      expect(component.users.length).toBe(3);
    }));

    it('shows error on failure', fakeAsync(() => {
      userServiceSpy.getUsers.and.returnValue(
        throwError(() => new Error('fail')),
      );
      component.fetchUsers();
      tick();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toContain('Failed to load users');
      expect(component.users.length).toBe(0);
    }));
  });

  describe('search & filter', () => {
    beforeEach(fakeAsync(() => {
      userServiceSpy.getUsers.and.returnValue(of(mockUsers));
      component.fetchUsers();
      tick();
    }));

    it('filters by searchTerm via applySearchFilter()', () => {
      component.searchTerm = 'ali';
      component.applySearchFilter();
      expect(component.users).toEqual([mockUsers[0]]);
    });

    it('filters by status via selectStatus()', () => {
      component.selectStatus('active');
      expect(component.selectedStatus).toBe('active');
      expect(component.isStatusDropdownOpen).toBeFalse();
      expect(component.users).toEqual([mockUsers[1]]);
    });
  });

  describe('sorting', () => {
    beforeEach(fakeAsync(() => {
      userServiceSpy.getUsers.and.returnValue(of(mockUsers));
      component.fetchUsers();
      tick();
    }));

    it('sorts ascending then toggles descending via requestSort()', () => {
      component.requestSort('name');
      expect(component.currentSortKey).toBe('name');
      expect(component.currentSortDirection).toBe('asc');
      expect(component.users[0].name).toBe('Alice');

      component.requestSort('name');
      expect(component.currentSortDirection).toBe('desc');
      expect(component.users[0].name).toBe('Cara');
    });
  });

  describe('dropdown behavior', () => {
    it('toggles status dropdown and stops propagation', () => {
      component.isStatusDropdownOpen = false;
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      component.toggleStatusDropdown(event);
      expect(component.isStatusDropdownOpen).toBeTrue();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('closes dropdown on document click outside', () => {
      component.isStatusDropdownOpen = true;
      spyOn(elementRef.nativeElement, 'querySelector').and.returnValue(null);
      component.onDocumentClick(new MouseEvent('click'));
      expect(component.isStatusDropdownOpen).toBeFalse();
    });
  });

  describe('navigation', () => {
    it('navigates to user and clears timeouts & state', () => {
      component['showCardTimeoutId'] = setTimeout(() => {}, 0);
      component['hideCardGraceTimeoutId'] = setTimeout(() => {}, 0);
      component['completeHideCardTimeoutId'] = setTimeout(() => {}, 0);
      spyOn(window, 'clearTimeout');

      component.navigateToUser(42);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/user', 42]);
      expect(component.userForCardDisplay).toBeNull();
      expect(clearTimeout).toHaveBeenCalledTimes(3);
    });
  });

  describe('getSelectedStatusLabel()', () => {
    it('returns correct status label', () => {
      component.selectedStatus = 'inactive';
      expect(component.getSelectedStatusLabel()).toBe('Inactive');
    });
  });

  describe('hover card behavior', () => {
    beforeEach(fakeAsync(() => {
      userServiceSpy.getUsers.and.returnValue(of(mockUsers));
      component.fetchUsers();
      tick();
    }));

    it('shows card after hover delay and sets visible', fakeAsync(() => {
      const event = new MouseEvent('mouseenter', {
        clientX: 100,
        clientY: 200,
      });
      expect(component.userForCardDisplay).toBeNull();
      component.onRowMouseEnter(event, mockUsers[0]);
      tick(component['INITIAL_HOVER_DELAY_MS'] + 1);
      expect(component.userForCardDisplay).toEqual(mockUsers[0]);
      expect((component as any).cardIsCurrentlyVisible).toBeTrue();
      expect(component.hoverCardStyle.display).toBe('block');
      expect(component.hoverCardStyle.opacity).toBe(1);
    }));

    it('updates card position on mouse move', fakeAsync(() => {
      component.userForCardDisplay = mockUsers[1];
      (component as any).activeHoverRowUser = mockUsers[1];
      (component as any).cardIsCurrentlyVisible = true;
      const updatePosSpy = spyOn<any>(
        component,
        'updateCardPosition',
      ).and.callThrough();
      component.onRowMouseMove(
        new MouseEvent('mousemove', { clientX: 50, clientY: 60 }),
      );
      expect(updatePosSpy).toHaveBeenCalledWith(50, 60);
    }));

    it('hides card on row mouse leave after grace and fade', fakeAsync(() => {
      (component as any).activeHoverRowUser = null;
      component.userForCardDisplay = mockUsers[2];
      (component as any).cardIsCurrentlyVisible = true;
      component.onRowMouseLeave();
      tick(
        component['MOUSE_LEAVE_GRACE_PERIOD_MS'] +
          component['FADE_ANIMATION_DURATION_MS'] +
          1,
      );
      expect(component.userForCardDisplay).toBeNull();
      expect(component.hoverCardStyle.display).toBe('none');
    }));

    it('clears timeouts on card mouse enter', () => {
      const clearSpy = spyOn<any>(component, 'clearAllTimeouts');
      component.onCardMouseEnter();
      expect(clearSpy).toHaveBeenCalled();
    });

    it('delegates to onRowMouseLeave on card mouse leave', () => {
      const leaveSpy = spyOn<any>(component, 'onRowMouseLeave');
      component.onCardMouseLeave();
      expect(leaveSpy).toHaveBeenCalled();
    });
  });
});
