import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { UserDetailsComponent, SafeUrlPipe } from './user-details.component';
import { UserService, User } from '../../services/user.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

class MockParamMap implements ParamMap {
  constructor(private params: Record<string, string>) {}
  has(name: string): boolean {
    return this.params[name] != null;
  }
  get(name: string): string | null {
    return this.params[name] ?? null;
  }
  getAll(name: string): string[] {
    const v = this.get(name);
    return v ? [v] : [];
  }
  keys: string[] = [];
}

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let paramMapSubject: Subject<ParamMap>;

  const mockUser: User = {
    id: 42,
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    website: 'example.com',
    address: {
      street: 'St',
      suite: '',
      city: 'City',
      zipcode: '00000',
      geo: { lat: '1.23', lng: '4.56' },
    },
    phone: '123',
    company: { name: 'Comp', catchPhrase: '', bs: '' },
  };

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUserById']);
    paramMapSubject = new Subject<ParamMap>();

    await TestBed.configureTestingModule({
      imports: [UserDetailsComponent, SafeUrlPipe],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMapSubject.asObservable() },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize loading', () => {
    expect(component).toBeTruthy();
    expect(component.isLoading).toBeTrue();
    expect(component.error).toBeNull();
  });

  describe('ngOnInit()', () => {
    it('fetches user when route has valid numeric id', fakeAsync(() => {
      userServiceSpy.getUserById.and.returnValue(of(mockUser));

      component.ngOnInit();
      paramMapSubject.next(new MockParamMap({ id: '42' }));
      tick();

      expect(component.user).toEqual(mockUser);
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
    }));

    it('sets error on invalid id', fakeAsync(() => {
      component.ngOnInit();
      paramMapSubject.next(new MockParamMap({ id: 'abc' }));
      tick();

      expect(component.user).toBeNull();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe('Invalid user ID provided.');
    }));

    it('sets error when no id in params', fakeAsync(() => {
      component.ngOnInit();
      paramMapSubject.next(new MockParamMap({}));
      tick();

      expect(component.user).toBeNull();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe('User ID not found in URL.');
    }));

    it('sets error on service failure', fakeAsync(() => {
      userServiceSpy.getUserById.and.returnValue(
        throwError(() => new Error('fail')),
      );

      component.ngOnInit();
      paramMapSubject.next(new MockParamMap({ id: '42' }));
      tick();

      expect(component.user).toBeNull();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe('Failed to load user details.');
    }));
  });

  describe('setActiveTab()', () => {
    it('updates activeTab property', () => {
      component.setActiveTab('address');
      expect(component.activeTab).toBe('address');
    });
  });

  describe('getMapUrl()', () => {
    it('returns embed URL when lat and lng provided', () => {
      const url = component.getMapUrl('1.23', '4.56');
      expect(url).toContain('maps.google.com/maps?q=1.23,4.56');
    });
    it('returns null when missing coords', () => {
      expect(component.getMapUrl(undefined, '4.56')).toBeNull();
      expect(component.getMapUrl('1.23', undefined)).toBeNull();
    });
  });
});
