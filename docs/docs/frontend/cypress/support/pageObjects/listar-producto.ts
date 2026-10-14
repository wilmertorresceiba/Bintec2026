export class ListarProductoPage {
  public visitar(): void {
    cy.visit('/producto/listar');
  }

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

  public obtenerBotonEditar(pos: number): Cypress.Chainable {
    return cy.get('article.producto-card').eq(pos).find('a.btn-secundario');
  }

  public obtenerBotonEliminar(pos: number): Cypress.Chainable {
    return cy.get('article.producto-card').eq(pos).find('button.btn-peligro');
  }
}
