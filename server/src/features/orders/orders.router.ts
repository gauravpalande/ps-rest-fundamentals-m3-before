import express from "express";
import { parse } from "path";
import { getOrders } from "./orders.service";

export const ordersRouter = express.Router();

ordersRouter.get("/", async (req, res) => {
    const query = req.query;
    const take = query.take;
    const skip = query.skip;

    if (
        typeof take === "string" &&
        parseInt(take) > 0 &&
        skip &&
        typeof skip === "string" &&
        parseInt(skip) > -1
    ) {
        const orders = await getOrders(parseInt(skip), parseInt(take));
        res.json(orders);
    } else{
        return res.status(400).json({ message: "Take and skip query parameters are required. " +
            "Take must be greater than 0 and skip must be greater than -1",
         });
    }});
