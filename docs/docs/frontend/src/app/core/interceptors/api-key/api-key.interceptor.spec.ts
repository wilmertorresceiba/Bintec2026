import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpService } from '@core/services/http/http.service';
import { apiKeyInterceptor } from './api-key.interceptor';

describe('ApiKeyInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpService: HttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpService,
        provideHttpClient(withInterceptors([apiKeyInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpService = TestBed.inject(HttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('debería crear el interceptor', () => {
    expect(apiKeyInterceptor).toBeTruthy();
  });

  it('debería añadir el x-pi-key a los headers', () => {
    httpService.doGet('/test-url').subscribe();
    const req: TestRequest = httpMock.expectOne('/test-url');
    expect(req.request.headers.get('x-api-key')).toBe('reqres-free-v1');
  });
});
