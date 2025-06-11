import express from "express";
import { parse } from "path";
import { addOrderItems, deleteOrder, deleteOrderItem, getOrderDetail, getOrders, upsertOrder } from "./orders.service";
import { validate } from "../../middleware/validation.middleware";
import { idItemIdUUIDRequestSchema, idUUIDRequestSchema, orderItemsDTORequestSchema, orderPOSTRequestSchema, orderPUTRequestSchema, pagingRequestSchema } from "../types";
import { create } from "xmlbuilder2";

export const ordersRouter = express.Router();

ordersRouter.get("/", validate(pagingRequestSchema), async (req, res) => {
    const data = pagingRequestSchema.parse(req);
    const orders = await getOrders(data.query.skip, data.query.take);
    res.json(orders);
});

ordersRouter.get("/:id", validate(idUUIDRequestSchema), async (req, res) => {
    const data = idUUIDRequestSchema.parse(req);
    const order = await getOrderDetail(data.params.id);
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
});

ordersRouter.post("/:id/items", validate(orderItemsDTORequestSchema), async (req, res) => {
    var data = orderItemsDTORequestSchema.parse(req);
    const newOrder = await addOrderItems(data.params.id, data.body);
    if (!newOrder) {
        return res.status(500).json({ error: "Failed to create order" });
    }
    res.status(201).json(newOrder);
});

ordersRouter.delete("/:id", validate(idUUIDRequestSchema), async (req, res) => {
    const data = idUUIDRequestSchema.parse(req);
    const order = await deleteOrder(data.params.id);
    if (!order) {
        return res.status(404).json({ error: "Order not deleted" });
    }
    res.json(order);
});

ordersRouter.delete("/:id/items/:itemId", validate(idItemIdUUIDRequestSchema), async (req, res) => {
    const data = idItemIdUUIDRequestSchema.parse(req);
    const order = await deleteOrderItem(data.params.id, data.params.itemId);
    if (!order) {
        return res.status(404).json({ error: "Order item not deleted" });
    }
    res.json(order);
});

ordersRouter.put("/:id", validate(orderPUTRequestSchema), async (req, res) => {
    const data = orderPUTRequestSchema.parse(req);
    const orderData = { customerId: "", ...data.body }; // Assuming customerId is optional and can be empty
    const updatedOrder = await upsertOrder(orderData, data.params.id);

    if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
    }
    res.json(updatedOrder);
});

ordersRouter.post("/", validate(orderPOSTRequestSchema), async (req, res) => {
  const data = orderPOSTRequestSchema.parse(req);
  const order = await upsertOrder(data.body);
  if (order != null) {
    if (req.headers["accept"] == "application/xml") {
      res.status(201).send(create().ele("order", order).end());
    } else {
      res.status(201).json(order);
    }
  } else {
    if (req.headers["accept"] == "application/xml") {
      res
        .status(500)
        .send(create().ele("error", { message: "Creation failed" }).end());
    } else {
      res.status(500).json({ message: "Creation failed" });
    }
  }
});