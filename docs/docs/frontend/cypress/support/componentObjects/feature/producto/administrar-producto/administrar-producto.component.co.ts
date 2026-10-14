export interface DatosFormularioProducto {
  title: string;
  price: string;
  description: string;
  image: string;
  category: string;
}

export class AdministrarProductoComponentObject {
  public obtenerTitulo(): Cypress.Chainable {
    return cy.get('h1.titulo');
  }

  public obtenerInputTitle(): Cypress.Chainable {
    return cy.get('input[id="title"]');
  }

  public obtenerInputPrice(): Cypress.Chainable {
    return cy.get('input[id="price"]');
  }

  public obtenerInputDescription(): Cypress.Chainable {
    return cy.get('input[id="description"]');
  }

  public obtenerInputImage(): Cypress.Chainable {
    return cy.get('input[id="image"]');
  }

  public obtenerSelectCategory(): Cypress.Chainable {
    return cy.get('select[id="category"]');
  }

  public obtenerErrorTitle(): Cypress.Chainable {
    return this.obtenerInputTitle().siblings('.input-error');
  }

  public obtenerErrorPrice(): Cypress.Chainable {
    return this.obtenerInputPrice().siblings('.input-error');
  }

  public obtenerErrorDescription(): Cypress.Chainable {
    return this.obtenerInputDescription().siblings('.input-error');
  }

  public obtenerErrorImage(): Cypress.Chainable {
    return this.obtenerInputImage().siblings('.input-error');
  }

  public obtenerBotonEnviar(): Cypress.Chainable {
    return cy.get('button[type="submit"]');
  }

  public obtenerResultado(): Cypress.Chainable {
    return cy.get('div.resultado');
  }

  public completarFormulario(datos: DatosFormularioProducto): void {
    this.obtenerInputTitle().type(datos.title);
    this.obtenerInputPrice().type(datos.price);
    this.obtenerInputDescription().type(datos.description);
    this.obtenerInputImage().type(datos.image);
    this.obtenerSelectCategory().select(datos.category);
  }

  public enviarFormulario(datos: DatosFormularioProducto): void {
    this.completarFormulario(datos);
    this.obtenerBotonEnviar().click();
  }
}
