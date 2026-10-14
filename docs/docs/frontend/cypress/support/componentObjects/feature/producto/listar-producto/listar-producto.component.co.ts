export class ListarProductoComponentObject {
  public obtenerTitulo(): Cypress.Chainable {
    return cy.get('h1.titulo');
  }

  public obtenerTarjetas(): Cypress.Chainable {
    return cy.get('article.producto-card');
  }

  public obtenerTarjeta(pos: number): Cypress.Chainable {
    return cy.get('article.producto-card').eq(pos);
  }

  public obtenerTituloProducto(pos: number): Cypress.Chainable {
    return cy.get('article.producto-card').eq(pos).find('h2.producto-card__titulo');
  }

  public obtenerCategoriaProducto(pos: number): Cypress.Chainable {
    return cy.get('article.producto-card').eq(pos).find('span.producto-card__categoria');
  }

  public obtenerPrecioProducto(pos: number): Cypress.Chainable {
    return cy.get('article.producto-card').eq(pos).find('span.producto-card__precio');
  }

  public obtenerBotonEditar(pos: number): Cypress.Chainable {
    return cy.get('article.producto-card').eq(pos).find('a.btn-secundario');
  }

  public obtenerBotonEliminar(pos: number): Cypress.Chainable {
    return cy.get('article.producto-card').eq(pos).find('button.btn-peligro');
  }
}
