import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { Product } from 'src/products/schemas/product.schema';
import { CartRepository } from './cart.repository';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async create(cart: Cart): Promise<CartDocument> {
    return this.cartRepository.create(cart);
  }

  async findById(id: ObjectId): Promise<CartDocument> {
    return this.cartRepository.findById(id);
  }
  async findByUserId(id: ObjectId): Promise<CartDocument> {
    return this.cartRepository.findByUserId(id);
  }

  async addProductWithUserIdAndProductId(
    userId: ObjectId,
    productId: ObjectId,
  ): Promise<boolean> {
    const cart = await this.cartFindOrCreatebyUserId(userId);
    cart.products.push(productId);
    await cart.save();
    return true;
  }

  calculateCartTotally(products: any): number {
    let totally = 0;
    for (const item of products) {
      totally += Number(item.price);
    }
    return totally;
  }

  async cartFindOrCreatebyUserId(id: ObjectId): Promise<CartDocument> {
    const cart = await this.cartRepository.findByUserId(id);
    if (cart) {
      return cart;
    } else {
      return await this.cartRepository.create({
        userId: id,
        products: [],
        totally: 0,
      });
    }
  }
  async removeProductFromCart(
    productId: ObjectId,
    userId: ObjectId,
  ): Promise<boolean> {
    const cart = await this.cartRepository.findByUserId(userId);
    cart.products.splice(cart.products.indexOf(productId), 1);
    await cart.save();
    return true;
  }

  findSameProductsInCart(products: any): Object {
    const uniqueList = new Set([]);
    const amount: Object = {};
    for (const product of products) {
      uniqueList.add(product._id);
    }
    for (const id of uniqueList) {
      amount[id] = products.filter((item) => item._id === id).length;
    }
    return amount;
  }
}
