import { ListarProductoPage } from '../../support/pageObjects/listar-producto';

describe('Listar Producto', () => {
  const listarProductoPage: ListarProductoPage = new ListarProductoPage();

  it('debería navegar a la página de listar productos y verificar el título', () => {
    listarProductoPage.visitar();
    cy.url().should('include', 'producto/listar');
    listarProductoPage.obtenerTitulo().should('have.text', 'Productos');
  });

  it('debería mostrar tarjetas de productos al cargar la página', () => {
    const CANTIDAD_MINIMA_PRODUCTOS: number = 1;
    listarProductoPage.visitar();
    listarProductoPage.obtenerTarjetas().should('have.length.above', CANTIDAD_MINIMA_PRODUCTOS);
  });

  it('debería mostrar los botones Editar y Eliminar en la primera tarjeta', () => {
    const PRIMER_PRODUCTO: number = 0;
    listarProductoPage.visitar();
    listarProductoPage.obtenerBotonEditar(PRIMER_PRODUCTO).should('exist');
    listarProductoPage.obtenerBotonEliminar(PRIMER_PRODUCTO).should('exist');
  });

  it('debería navegar a la página de editar al hacer click en Editar', () => {
    const PRIMER_PRODUCTO: number = 0;
    listarProductoPage.visitar();
    listarProductoPage.obtenerBotonEditar(PRIMER_PRODUCTO).click();
    cy.url().should('include', 'producto/editar');
  });
});
