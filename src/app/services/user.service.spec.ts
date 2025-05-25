import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserService, User } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all users via GET', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        name: 'A',
        username: 'a',
        email: 'a@x.com',
        website: 'a.com',
        phone: '123',
        address: {
          street: '',
          suite: '',
          city: '',
          zipcode: '',
          geo: { lat: '', lng: '' },
        },
        company: { name: '', catchPhrase: '', bs: '' },
      },
    ];

    service.getUsers().subscribe((users) => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(
      'https://jsonplaceholder.typicode.com/users',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should fetch a user by ID via GET', () => {
    const mockUser: User = {
      id: 42,
      name: 'Test',
      username: 'test',
      email: 'test@x.com',
      website: 'test.com',
      phone: '000',
      address: {
        street: '',
        suite: '',
        city: '',
        zipcode: '',
        geo: { lat: '', lng: '' },
      },
      company: { name: '', catchPhrase: '', bs: '' },
    };

    service.getUserById(42).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(
      'https://jsonplaceholder.typicode.com/users/42',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });
});
