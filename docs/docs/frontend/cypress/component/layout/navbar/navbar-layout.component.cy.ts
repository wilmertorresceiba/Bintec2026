import { provideRouter } from '@angular/router';
import { mount } from 'cypress/angular';
import { NavbarComponentObject } from '@cy/support/componentObjects/layout/navbar/navbar-layout.component.co';
import { NavbarComponent } from '@layout/navbar/navbar-layout.component';

const PRIMER_ELEMENTO_MENU: number = 0;
const SEGUNDO_ELEMENTO_MENU: number = 1;

describe('NavbarComponent', () => {
  const navbarCo: NavbarComponentObject = new NavbarComponentObject();
  const montarComponente: () => Cypress.Chainable = () =>
    mount(NavbarComponent, {
      imports: [NavbarComponent],
      providers: [provideRouter([])],
      componentProperties: {
        elementosMenu: [
          {
            nombre: 'Prueba 1',
            url: '/prueba1',
            opciones: {
              rutaActivaExacta: true,
            },
          },
          {
            nombre: 'Prueba 2',
            url: '/prueba2',
            opciones: {
              rutaActivaExacta: true,
            },
          },
        ],
      },
    });

  it('deberia verificar que existan los elementos del menu', () => {
    const cantidadElementosMenu: number = 2;
    montarComponente();
    navbarCo.obtenerElementosMenu().should('have.length', cantidadElementosMenu);
  });

  it('deberia verificar que los elementos del menu coincidan', () => {
    montarComponente();
    navbarCo.obtenerElementoMenu(PRIMER_ELEMENTO_MENU).should('contain.text', 'Prueba 1');
    navbarCo.obtenerElementoMenu(SEGUNDO_ELEMENTO_MENU).should('contain.text', 'Prueba 2 ');
  });
});
