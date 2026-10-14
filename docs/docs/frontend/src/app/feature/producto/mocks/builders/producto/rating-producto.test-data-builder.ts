import { RatingProducto } from '@feature/producto/shared/interfaces/rating-producto';

export class RatingProductoTestDataBuilder {
  private readonly rating: RatingProducto = {
    rate: 4.5,
    count: 120,
  };

  public conRate(rate: number): this {
    this.rating.rate = rate;
    return this;
  }

  public conCount(count: number): this {
    this.rating.count = count;
    return this;
  }

  public construir(): RatingProducto {
    return { ...this.rating };
  }
}
