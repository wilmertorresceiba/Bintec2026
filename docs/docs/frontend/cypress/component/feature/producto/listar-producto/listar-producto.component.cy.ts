import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { mount } from 'cypress/angular';
import { HttpService } from '@core/services/http/http.service';
import { ListarProductoComponentObject } from '@cy/support/componentObjects/feature/producto/listar-producto/listar-producto.component.co';
import { ListarProductoComponent } from '@feature/producto/components/listar-producto/listar-producto.component';
import { ProductoTestDataBuilder } from '@feature/producto/mocks/builders/producto/producto.test-data-builder';
import { Producto } from '@feature/producto/shared/interfaces/producto';
import { ProductoService } from '@feature/producto/shared/service/producto.service';

const CANTIDAD_PRODUCTOS: number = 1;
const PRIMER_PRODUCTO: number = 0;
const CANTIDAD_CERO: number = 0;
const CANTIDAD_LLAMADOS_API: number = 1;

describe('ListarProductoComponent', () => {
  const listarProductoCo: ListarProductoComponentObject = new ListarProductoComponentObject();
  const producto: Producto = new ProductoTestDataBuilder().construir();
  const productos: Producto[] = [producto];

  const montarComponente: () => Cypress.Chainable = () =>
    mount(ListarProductoComponent, {
      imports: [ListarProductoComponent],
      providers: [ProductoService, HttpService, provideHttpClient(), provideRouter([])],
    });

  beforeEach(() => {
    cy.intercept('GET', '**/products', {
      statusCode: 200,
      body: productos,
    }).as('obtenerProductos');
  });

  it('debería mostrar el título y las tarjetas de productos al cargar', () => {
    montarComponente();

    cy.wait('@obtenerProductos');
    cy.get('@obtenerProductos.all').should('have.length', CANTIDAD_LLAMADOS_API);

    listarProductoCo.obtenerTitulo().should('have.text', 'Productos');
    listarProductoCo.obtenerTarjetas().should('have.length', CANTIDAD_PRODUCTOS);
    listarProductoCo.obtenerTituloProducto(PRIMER_PRODUCTO).should('have.text', producto.title);
    listarProductoCo
      .obtenerCategoriaProducto(PRIMER_PRODUCTO)
      .should('have.text', producto.category);
  });

  it('debería mostrar los botones Editar y Eliminar en cada tarjeta', () => {
    montarComponente();
    cy.wait('@obtenerProductos');

    listarProductoCo.obtenerBotonEditar(PRIMER_PRODUCTO).should('exist');
    listarProductoCo.obtenerBotonEliminar(PRIMER_PRODUCTO).should('exist');
    listarProductoCo.obtenerBotonEliminar(PRIMER_PRODUCTO).should('have.text', ' Eliminar ');
  });

  it('debería eliminar la tarjeta del listado al hacer click en Eliminar', () => {
    cy.intercept('DELETE', '**/products/*', {
      statusCode: 200,
      body: producto,
    }).as('eliminarProducto');

    montarComponente();
    cy.wait('@obtenerProductos');

    listarProductoCo.obtenerTarjetas().should('have.length', CANTIDAD_PRODUCTOS);
    listarProductoCo.obtenerBotonEliminar(PRIMER_PRODUCTO).click();

    cy.wait('@eliminarProducto');
    listarProductoCo.obtenerTarjetas().should('have.length', CANTIDAD_CERO);
  });
});
