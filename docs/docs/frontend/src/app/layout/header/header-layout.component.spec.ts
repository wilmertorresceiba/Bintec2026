import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HeaderComponent } from './header-layout.component';

@Component({ template: '' })
class PaginaVaciaComponent {}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'dashboard', component: PaginaVaciaComponent, data: { miga: 'Mis productos' } },
        ]),
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    await router.navigateByUrl('/dashboard');
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('debe mostrar la miga de pan con la página actual marcada', () => {
    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelector('nav[aria-label="Ruta de navegación"]')).not.toBeNull();
    expect(elemento.querySelector('a.migas__enlace')?.textContent).toContain('Inicio');
    expect(elemento.querySelector('[aria-current="page"]')?.textContent).toContain('Mis productos');
  });

  it('debe incluir el código de seguridad', () => {
    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelector('app-codigo-seguridad')).not.toBeNull();
  });
});
