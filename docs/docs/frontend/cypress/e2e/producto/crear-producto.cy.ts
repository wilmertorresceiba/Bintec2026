import {
  AdministrarProductoPage,
  DatosFormularioProducto,
} from '../../support/pageObjects/administrar-producto';

describe('Crear Producto', () => {
  const administrarProductoPage: AdministrarProductoPage = new AdministrarProductoPage();

  it('debería navegar a la página de crear producto y mostrar el título', () => {
    administrarProductoPage.visitarCrear();
    cy.url().should('include', 'producto/crear');
    administrarProductoPage.obtenerTitulo().should('have.text', 'Crear producto');
  });

  it('debería mostrar errores de validación al enviar el formulario vacío', () => {
    administrarProductoPage.visitarCrear();
    administrarProductoPage.obtenerBotonEnviar().click();
    administrarProductoPage.obtenerErrorTitle().should('have.text', 'Este campo es requerido.');
    administrarProductoPage
      .obtenerErrorDescription()
      .should('have.text', 'Este campo es requerido.');
    administrarProductoPage.obtenerErrorImage().should('have.text', 'Este campo es requerido.');
  });

  it('debería mostrar errores de validación con datos inválidos', () => {
    administrarProductoPage.visitarCrear();
    cy.fixture('producto/producto').then(
      (fixture: { productoInvalido: DatosFormularioProducto }) => {
        administrarProductoPage.enviarFormulario({
          title: fixture.productoInvalido.title,
          price: fixture.productoInvalido.price,
          description: fixture.productoInvalido.description,
          image: fixture.productoInvalido.image,
          category: fixture.productoInvalido.category,
        });
        administrarProductoPage
          .obtenerErrorTitle()
          .should('have.text', 'Este campo debe tener al menos 3 caracteres.');
        administrarProductoPage
          .obtenerErrorDescription()
          .should('have.text', 'Este campo debe tener al menos 10 caracteres.');
        administrarProductoPage
          .obtenerErrorImage()
          .should('have.text', 'No cumple con el formato.');
      }
    );
  });

  it('debería crear el producto, limpiar el formulario y mostrar el resultado', () => {
    administrarProductoPage.visitarCrear();
    cy.fixture('producto/producto').then((fixture: { productoValido: DatosFormularioProducto }) => {
      administrarProductoPage.enviarFormulario({
        title: fixture.productoValido.title,
        price: fixture.productoValido.price,
        description: fixture.productoValido.description,
        image: fixture.productoValido.image,
        category: fixture.productoValido.category,
      });
      administrarProductoPage.obtenerInputTitle().should('have.value', '');
      administrarProductoPage.obtenerResultado().should('exist');
    });
  });
});
