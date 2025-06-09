import express from "express";
import { getCustomerDetail, getCustomers, searchCustomers, upsertCustomer } from "./customers.service";
import { getOrdersForCustomer } from "../orders/orders.service";
import { validate } from "../../middleware/validation.middleware";
import { customerPOSTRequestSchema, idUUIDRequestSchema } from "../types";

export const customersRouter = express.Router();

customersRouter.get("/", async (req, res) => {
  const customers = await getCustomers();
  res.json(customers);
});

customersRouter.get("/:id", validate(idUUIDRequestSchema), async (req, res) => {
    const data = idUUIDRequestSchema.parse(req);
  const customer  = await getCustomerDetail(data.params.id);
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }
  res.json(customer);
});

customersRouter.get("/:id/orders", validate(idUUIDRequestSchema), async (req, res) => {
    const data = idUUIDRequestSchema.parse(req);
  const customerId = data.params.id;
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

customersRouter.post("/", validate(customerPOSTRequestSchema), async (req, res) => {
    var data = customerPOSTRequestSchema.parse(req);
    const newCustomer = await upsertCustomer(data.body);
    if (!newCustomer) {
        return res.status(500).json({ error: "Failed to create customer" });
    }
    res.status(201).json(newCustomer);
});