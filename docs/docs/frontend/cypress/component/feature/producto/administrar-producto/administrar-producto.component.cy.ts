import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { mount } from 'cypress/angular';
import { HttpService } from '@core/services/http/http.service';
import {
  AdministrarProductoComponentObject,
  DatosFormularioProducto,
} from '@cy/support/componentObjects/feature/producto/administrar-producto/administrar-producto.component.co';
import { AdministrarProductoComponent } from '@feature/producto/components/administrar-producto/administrar-producto.component';
import { CrearProductoTestDataBuilder } from '@feature/producto/mocks/builders/producto/crear-producto.test-data-builder';
import { ProductoTestDataBuilder } from '@feature/producto/mocks/builders/producto/producto.test-data-builder';
import { CrearProducto } from '@feature/producto/shared/interfaces/crear-producto';
import { CrearProductoRespuesta } from '@feature/producto/shared/interfaces/crear-producto-respuesta';
import { Producto } from '@feature/producto/shared/interfaces/producto';
import { ProductoService } from '@feature/producto/shared/service/producto.service';
import { erroresFormulario } from '@shared/constants/errores-formulario';

const ID_RESPUESTA: number = 101;
const ID_EDICION: number = 1;

describe('AdministrarProductoComponent', () => {
  const administrarProductoCo: AdministrarProductoComponentObject =
    new AdministrarProductoComponentObject();

  const montarComponente: () => Cypress.Chainable = () =>
    mount(AdministrarProductoComponent, {
      imports: [AdministrarProductoComponent],
      providers: [ProductoService, HttpService, provideHttpClient(), provideRouter([])],
    });

  context('modo creación', () => {
    beforeEach(() => {
      montarComponente();
    });

    it('debería mostrar el título Crear producto y todos los campos del formulario', () => {
      administrarProductoCo.obtenerTitulo().should('have.text', 'Crear producto');
      administrarProductoCo.obtenerInputTitle().should('exist');
      administrarProductoCo.obtenerInputPrice().should('exist');
      administrarProductoCo.obtenerInputDescription().should('exist');
      administrarProductoCo.obtenerInputImage().should('exist');
      administrarProductoCo.obtenerSelectCategory().should('exist');
      administrarProductoCo.obtenerBotonEnviar().should('contain.text', 'Crear producto');
    });

    it('debería mostrar errores de validación al enviar el formulario vacío', () => {
      administrarProductoCo.obtenerBotonEnviar().click();

      administrarProductoCo
        .obtenerErrorTitle()
        .should('have.text', erroresFormulario['required']({}));
      administrarProductoCo
        .obtenerErrorDescription()
        .should('have.text', erroresFormulario['required']({}));
      administrarProductoCo
        .obtenerErrorImage()
        .should('have.text', erroresFormulario['required']({}));
    });

    it('debería mostrar errores de validación con datos inválidos', () => {
      cy.fixture('producto/producto').then(
        (fixture: { productoInvalido: DatosFormularioProducto }) => {
          administrarProductoCo.enviarFormulario({
            title: fixture.productoInvalido.title,
            price: fixture.productoInvalido.price,
            description: fixture.productoInvalido.description,
            image: fixture.productoInvalido.image,
            category: fixture.productoInvalido.category,
          });
        }
      );

      administrarProductoCo
        .obtenerErrorTitle()
        .should('have.text', erroresFormulario['minlength']({ requiredLength: 3 }));
      administrarProductoCo
        .obtenerErrorDescription()
        .should('have.text', erroresFormulario['minlength']({ requiredLength: 10 }));
      administrarProductoCo
        .obtenerErrorImage()
        .should('have.text', erroresFormulario['pattern']({}));
    });

    it('debería limpiar el formulario y mostrar el resultado tras crear un producto', () => {
      const nuevoProducto: CrearProducto = new CrearProductoTestDataBuilder().construir();
      const respuesta: CrearProductoRespuesta = { ...nuevoProducto, id: ID_RESPUESTA };

      cy.intercept('POST', '**/products', {
        statusCode: 200,
        body: respuesta,
      }).as('crearProducto');

      cy.fixture('producto/producto').then(
        (fixture: { productoValido: DatosFormularioProducto }) => {
          administrarProductoCo.enviarFormulario({
            title: fixture.productoValido.title,
            price: fixture.productoValido.price,
            description: fixture.productoValido.description,
            image: fixture.productoValido.image,
            category: fixture.productoValido.category,
          });
        }
      );

      cy.wait('@crearProducto');
      administrarProductoCo.obtenerInputTitle().should('have.value', '');
      administrarProductoCo.obtenerInputDescription().should('have.value', '');
      administrarProductoCo.obtenerResultado().should('exist');
    });
  });

  context('modo edición', () => {
    const producto: Producto = new ProductoTestDataBuilder().conId(ID_EDICION).construir();

    beforeEach(() => {
      cy.intercept('GET', `**/products/${ID_EDICION}`, {
        statusCode: 200,
        body: producto,
      }).as('obtenerProducto');

      mount(AdministrarProductoComponent, {
        imports: [AdministrarProductoComponent],
        providers: [ProductoService, HttpService, provideHttpClient(), provideRouter([])],
        componentProperties: { idProducto: String(ID_EDICION) },
      });

      cy.wait('@obtenerProducto');
    });

    it('debería mostrar el título Editar producto y el botón Actualizar producto', () => {
      administrarProductoCo.obtenerTitulo().should('have.text', 'Editar producto');
      administrarProductoCo.obtenerBotonEnviar().should('contain.text', 'Actualizar producto');
    });

    it('debería pre-cargar el formulario con los datos del producto consultado', () => {
      administrarProductoCo.obtenerInputTitle().should('have.value', producto.title);
      administrarProductoCo.obtenerInputDescription().should('have.value', producto.description);
      administrarProductoCo.obtenerInputImage().should('have.value', producto.image);
      administrarProductoCo.obtenerSelectCategory().should('have.value', producto.category);
    });

    it('debería actualizar el producto, mostrar el resultado y mantener el formulario', () => {
      const productoActualizado: Producto = new ProductoTestDataBuilder()
        .conId(ID_EDICION)
        .construir();

      cy.intercept('PUT', `**/products/${ID_EDICION}`, {
        statusCode: 200,
        body: productoActualizado,
      }).as('actualizarProducto');

      administrarProductoCo.obtenerBotonEnviar().click();
      cy.wait('@actualizarProducto');

      administrarProductoCo.obtenerResultado().should('exist');
      administrarProductoCo.obtenerInputTitle().should('not.have.value', '');
    });
  });
});
