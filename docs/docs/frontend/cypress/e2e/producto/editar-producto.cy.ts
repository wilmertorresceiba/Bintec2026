import { AdministrarProductoPage } from '../../support/pageObjects/administrar-producto';

interface ProductoMock {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

const ID_PRODUCTO: number = 1;

const PRODUCTO_MOCK: ProductoMock = {
  id: ID_PRODUCTO,
  title: 'Producto de prueba',
  price: 99.99,
  description: 'Descripción del producto de prueba',
  category: 'electronics',
  image: 'https://fakestoreapi.com/img/test.jpg',
  rating: { rate: 4.5, count: 120 },
};

describe('Editar Producto', () => {
  const administrarProductoPage: AdministrarProductoPage = new AdministrarProductoPage();

  beforeEach(() => {
    cy.intercept('GET', `**/products/${ID_PRODUCTO}`, {
      statusCode: 200,
      body: PRODUCTO_MOCK,
    }).as('obtenerProducto');
  });

  it('debería navegar a la página de editar producto y mostrar el título', () => {
    administrarProductoPage.visitarEditar(ID_PRODUCTO);
    cy.url().should('include', `producto/editar/${ID_PRODUCTO}`);
    administrarProductoPage.obtenerTitulo().should('have.text', 'Editar producto');
  });

  it('debería pre-cargar el formulario con los datos del producto', () => {
    administrarProductoPage.visitarEditar(ID_PRODUCTO);
    cy.wait('@obtenerProducto');

    administrarProductoPage.obtenerInputTitle().should('have.value', PRODUCTO_MOCK.title);
    administrarProductoPage
      .obtenerInputDescription()
      .should('have.value', PRODUCTO_MOCK.description);
    administrarProductoPage.obtenerInputImage().should('have.value', PRODUCTO_MOCK.image);
    administrarProductoPage.obtenerSelectCategory().should('have.value', PRODUCTO_MOCK.category);
  });

  it('debería actualizar el producto y mostrar el resultado de la actualización', () => {
    const productoActualizado: ProductoMock = { ...PRODUCTO_MOCK };
    cy.intercept('PUT', `**/products/${ID_PRODUCTO}`, {
      statusCode: 200,
      body: productoActualizado,
    }).as('actualizarProducto');

    administrarProductoPage.visitarEditar(ID_PRODUCTO);
    cy.wait('@obtenerProducto');

    administrarProductoPage.obtenerBotonEnviar().click();
    cy.wait('@actualizarProducto');
    administrarProductoPage.obtenerResultado().should('exist');
  });
});
