import express from "express";
import { parse } from "path";
import { addOrderItems, getOrderDetail, getOrders, upsertOrder } from "./orders.service";
import { validate } from "../../middleware/validation.middleware";
import { idUUIDRequestSchema, orderItemsDTORequestSchema, orderPOSTRequestSchema, pagingRequestSchema } from "../types";

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