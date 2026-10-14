import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingComponent } from '@shared/components/loading/loading.component';

describe('LoadingComponent', () => {
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoadingComponent] }).compileComponents();
    fixture = TestBed.createComponent(LoadingComponent);
  });

  it('debe mostrar el mensaje por defecto con role status', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[role="status"]')).not.toBeNull();
    expect(el.textContent).toContain('Cargando…');
  });

  it('debe mostrar un mensaje personalizado', () => {
    fixture.componentRef.setInput('mensaje', 'Validando tus datos');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Validando tus datos');
  });

  it('debe ocultar visualmente el mensaje sin quitarlo del DOM', () => {
    fixture.componentRef.setInput('ocultarMensaje', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loading__mensaje--oculto')).not.toBeNull();
  });

  it('debe reflejar modo y tamaño en el host', () => {
    fixture.componentRef.setInput('modo', 'pantalla');
    fixture.componentRef.setInput('tamano', 'lg');
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('data-modo')).toBe('pantalla');
    expect(host.getAttribute('data-tamano')).toBe('lg');
  });
});
