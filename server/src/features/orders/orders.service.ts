import { PrismaClient } from "@prisma/client";
import {
  BasicOrder,
  Order,
  OrderDTO,
  OrderDetail,
  orderItemDTO,
} from "../types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export function getOrders(skip: number, take: number): Promise<Order[]> {
  return prisma.order.findMany({
    skip: skip,
    take: take,
    include: {
      customer: true,
    },
  });
}

export function getOrdersForCustomer(
  customerId: string
): Promise<BasicOrder[]> {
  return prisma.order.findMany({
    where: {
      customerId: customerId,
    },
  });
}

export function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  return prisma.order.findFirst({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: {
          item: true,
        },
      },
    },
  });
}

export function upsertOrder(
  order: OrderDTO,
  orderId?: string | null
): Promise<Order | null> {
  return prisma.order.upsert({
    where: {
      id: orderId || "",
    },
    update: {
      status: order.status,
    },
    create: {
      customerId: order.customerId,
      status: order.status || "Created",
    },
    include: {
      customer: true,
    },
  });
}

export function deleteOrder(orderId: string): Promise<Order | null> {
  return prisma.order
    .delete({
      where: { id: orderId },
      include: {
        customer: true,
      },
    })
    .catch((error) => {
      if (
        error instanceof PrismaClientKnownRequestError &&
        (error as PrismaClientKnownRequestError).code == "P2025"
      ) {
        return Promise.resolve(null);
      } else {
        throw error;
      }
    });
}

export function addOrderItems(
  orderId: string,
  items: orderItemDTO[]
): Promise<OrderDetail | null> {
  return Promise.all(
    items.map((item) => {
      return prisma.orderItem.create({
        data: {
          orderId: orderId,
          itemId: item.itemId,
          quantity: item.quantity,
        },
      });
    })
  ).then(() => {
    return getOrderDetail(orderId);
  });
}

export function deleteOrderItem(
  orderId: string,
  itemId: number
): Promise<OrderDetail | null> {
  return prisma.orderItem
    .delete({
      where: {
        orderId_itemId: {
          orderId: orderId,
          itemId: itemId,
        },
      },
    })
    .then(() => getOrderDetail(orderId));
}
