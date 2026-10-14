import { Producto } from '@feature/producto/shared/interfaces/producto';
import { RatingProducto } from '@feature/producto/shared/interfaces/rating-producto';

export class ProductoTestDataBuilder {
  private readonly producto: Producto = {
    id: 1,
    title: 'Producto de prueba',
    price: 99.99,
    description: 'Descripción del producto de prueba',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/test.jpg',
    rating: {
      rate: 4.5,
      count: 120,
    },
  };

  public conId(id: number): this {
    this.producto.id = id;
    return this;
  }

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

  public conCategory(category: string): this {
    this.producto.category = category;
    return this;
  }

  public conImage(image: string): this {
    this.producto.image = image;
    return this;
  }

  public conRating(rating: RatingProducto): this {
    this.producto.rating = rating;
    return this;
  }

  public construir(): Producto {
    return { ...this.producto, rating: { ...this.producto.rating } };
  }
}
