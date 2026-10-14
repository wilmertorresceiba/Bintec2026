export class NavbarComponentObject {
  public obtenerElementosMenu(): Cypress.Chainable {
    return cy.get('a');
  }
  public obtenerElementoMenu(pos: number): Cypress.Chainable {
    return cy.get('a').eq(pos);
  }
}
