import express from "express";
import { getCustomerDetail, getCustomers, searchCustomers } from "./customers.service";
import { getOrdersForCustomer } from "../orders/orders.service";

export const customersRouter = express.Router();

customersRouter.get("/", async (req, res) => {
  const customers = await getCustomers();
  res.json(customers);
});

customersRouter.get("/:id", async (req, res) => {
  const customer  = await getCustomerDetail(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }
  res.json(customer);
});

customersRouter.get("/:id/orders", async (req, res) => {
  const customerId = req.params.id;
    const orders = await getOrdersForCustomer(customerId);
    if (!orders) {
        return res.status(404).json({ error: "Orders not found for this customer" });
        }
    res.json(orders);
});

customersRouter.get("/search/:query", async (req, res) => {
    const query = req.params.query;
    const customers = await searchCustomers(query);
    if (customers.length === 0) {
        return res.status(404).json({ error: "No customers found" });
    }
    res.json(customers);
});
