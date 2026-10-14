import { CrearProducto } from '@feature/producto/shared/interfaces/crear-producto';

export class CrearProductoTestDataBuilder {
  private readonly producto: CrearProducto = {
    title: 'Producto de prueba',
    price: 29.99,
    description: 'Descripción del producto de prueba para testing',
    image: 'https://fakestoreapi.com/img/test.jpg',
    category: 'electronics',
  };

  public conTitle(title: string): this {
    this.producto.title = title;
    return this;
  }

  public conPrice(price: number): this {
    this.producto.price = price;
    return this;
  }

  public conDescription(description: string): this {
    this.producto.description = description;
    return this;
  }

  public conImage(image: string): this {
    this.producto.image = image;
    return this;
  }

  public conCategory(category: string): this {
    this.producto.category = category;
    return this;
  }

  public construir(): CrearProducto {
    return { ...this.producto };
  }
}
