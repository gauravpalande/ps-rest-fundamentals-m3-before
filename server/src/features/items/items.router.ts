import express from "express";
import { get } from "http";
import { deleteItem, getItemDetail, getItems, upsertItem } from "./items.service";
import { validate } from "../../middleware/validation.middleware";
import { idItemIdUUIDRequestSchema, idNumberRequestSchema, itemPOSTRequestSchema, itemPUTRequestSchema } from "../types";
import { INVALID } from "zod";
import { create } from "xmlbuilder2";

export const itemsRouter = express.Router();

itemsRouter.get("/", async (req, res) => {
  const items = await getItems();
  items.forEach((item) => {
    item.imageUrl = buildImageUrl(req, item.id);
  });
  if(req.headers["accept"] === "application/xml") {
    // Convert item to XML format if requested
    const root = create().ele("items");
    items.forEach((i)=> {
      root.ele("item", i);
    });
    res.status(200).send(root.end({ prettyPrint: true }));
  } else {
  res.json(items);
  }
});

itemsRouter.get("/:id", validate(idNumberRequestSchema), async (req, res) => {
  const data = idNumberRequestSchema.parse(req);
  const item  = await getItemDetail(data.params.id);
  if (!item) {
    if(req.headers["accept"] === "application/xml") {
      // Convert item to XML format if requested
      return res.status(404).send(create().ele("error", { message: "Item not found" }).end());
    }
    else {
    return res.status(404).json({ message: "Item not found" });
    }
  }
  item.imageUrl = buildImageUrl(req, item.id);
  if(req.headers["accept"] === "application/xml") {
    // Convert item to XML format if requested
    res.status(200).send(create().ele("item", item).end());
  } else {
  res.json(item);
  }
});

itemsRouter.post("/", validate(itemPOSTRequestSchema), async (req, res) => {
  const data = itemPOSTRequestSchema.parse(req);
  const newItem = await upsertItem(data.body);

  if (!newItem) {
    return res.status(500).json({ error: "Failed to create item" });
  }
  newItem.imageUrl = buildImageUrl(req, newItem.id);
  res.status(201).json(newItem);
});

itemsRouter.delete("/:id", validate(idNumberRequestSchema), async (req, res) => {
  const data = idNumberRequestSchema.parse(req);
  const item = await deleteItem(data.params.id);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  res.status(204).send();
});

itemsRouter.put("/", validate(itemPUTRequestSchema), async (req, res) => {
  const data = itemPUTRequestSchema.parse(req);
  const updatedItem = await upsertItem(data.body, data.params.id);

  if (!updatedItem) {
    return res.status(404).json({ error: "Item not found" });
  }
  updatedItem.imageUrl = buildImageUrl(req, updatedItem.id);
  res.json(updatedItem);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function buildImageUrl(req: any, id: number): string {
  return `${req.protocol}://${req.get("host")}/images/${id}.jpg`;
}
