import express from "express";
import { deleteCustomer, getCustomerDetail, getCustomers, searchCustomers, upsertCustomer } from "./customers.service";
import { getOrdersForCustomer } from "../orders/orders.service";
import { validate } from "../../middleware/validation.middleware";
import { customerPOSTRequestSchema, idUUIDRequestSchema } from "../types";
import { create } from "xmlbuilder2";

export const customersRouter = express.Router();

customersRouter.get("/", async (req, res) => {
  const customers = await getCustomers();
  if(req.headers["accept"] === "application/xml") {
    // Convert customers to XML format if requested
    const root = create().ele("customers");
    customers.forEach((customer) => {
        root.ele("customer", customer);
        });
    res.status(200).send(root.end({ prettyPrint: true }));
    }
    else {
  res.json(customers);
    }
});

customersRouter.get("/:id", validate(idUUIDRequestSchema), async (req, res) => {
    const data = idUUIDRequestSchema.parse(req);
  const customer  = await getCustomerDetail(data.params.id);
  if (!customer) {
    if(req.headers["accept"] === "application/xml") {
      // Convert customer to XML format if requested
      return res.status(404).send(create().ele("error", { message: "Customer not found" }).end());
    } else {
      return res.status(404).json({ error: "Customer not found" });
    }
  }
    if(req.headers["accept"] === "application/xml") {
        // Convert customer to XML format if requested
        res.status(200).send(create().ele("customer", customer).end());
    } else {
  res.json(customer);
    }
});

customersRouter.get("/:id/orders", validate(idUUIDRequestSchema), async (req, res) => {
    const data = idUUIDRequestSchema.parse(req);
  const customerId = data.params.id;
    const orders = await getOrdersForCustomer(customerId);
    if (!orders) {
        if(req.headers["accept"] === "application/xml") {
            // Convert error to XML format if requested
            return res.status(404).send(create().ele("error", { message: "Orders not found for this customer" }).end());
        }
        return res.status(404).json({ error: "Orders not found for this customer" });
        }
    if(req.headers["accept"] === "application/xml") {
        // Convert orders to XML format if requested
        const root = create().ele("orders");
        orders.forEach((order) => {
            root.ele("order", order);
        });
        res.status(200).send(root.end({ prettyPrint: true }));
    }
    else {
    res.json(orders);
    }
});

customersRouter.get("/search/:query", async (req, res) => {
    const query = req.params.query;
    const customers = await searchCustomers(query);
    if (customers.length === 0) {
        if(req.headers["accept"] === "application/xml") {
            // Convert error to XML format if requested
            return res.status(404).send(create().ele("error", { message: "No customers found" }).end());
        }
        return res.status(404).json({ error: "No customers found" });
    }
    if(req.headers["accept"] === "application/xml") {
        // Convert customers to XML format if requested
        const root = create().ele("customers");
        customers.forEach((customer) => {
            root.ele("customer", customer);
        });
        res.status(200).send(root.end({ prettyPrint: true }));
    }
    else {
    // Return customers in JSON format
    res.json(customers);
    }
});

customersRouter.post("/", validate(customerPOSTRequestSchema), async (req, res) => {
    var data = customerPOSTRequestSchema.parse(req);
    const newCustomer = await upsertCustomer(data.body);
    if (!newCustomer) {
        if(req.headers["accept"] === "application/xml") {
            // Convert error to XML format if requested
            return res.status(500).send(create().ele("error", { message: "Failed to create customer" }).end());
        }
        return res.status(500).json({ error: "Failed to create customer" });
    }
    if(req.headers["accept"] === "application/xml") {
        // Convert new customer to XML format if requested
        res.status(201).send(create().ele("customer", newCustomer).end());
    } else {
    res.status(201).json(newCustomer);
    }
});

customersRouter.delete("/:id", validate(idUUIDRequestSchema), async (req, res) => {
    const data = idUUIDRequestSchema.parse(req);
    const customer = await deleteCustomer(data.params.id);
    if (!customer) {
        return res.status(500).json({ error: "Failed to delete customer" });
    }
    res.json(customer);
});