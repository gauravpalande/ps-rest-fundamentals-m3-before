import express from "express";
import { get } from "http";
import { getItemDetail, getItems, upsertItem } from "./items.service";
import { validate } from "../../middleware/validation.middleware";
import { idItemIdUUIDRequestSchema, itemPOSTRequestSchema } from "../types";

export const itemsRouter = express.Router();

itemsRouter.get("/", async (req, res) => {
  const items = await getItems();
  items.forEach((item) => {
    item.imageUrl = buildImageUrl(req, item.id);
  });
  res.json(items);
});

itemsRouter.get("/:id", validate(idItemIdUUIDRequestSchema), async (req, res) => {
  const data = idItemIdUUIDRequestSchema.parse(req);
  const id = parseInt(data.params.id);
  const item  = await getItemDetail(id);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  item.imageUrl = buildImageUrl(req, item.id);
  res.json(item);
}
);

itemsRouter.post("/", validate(itemPOSTRequestSchema), async (req, res) => {
  const data = itemPOSTRequestSchema.parse(req);
  const newItem = await upsertItem(data.body);

  if (!newItem) {
    return res.status(500).json({ error: "Failed to create item" });
  }
  newItem.imageUrl = buildImageUrl(req, newItem.id);
  res.status(201).json(newItem);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function buildImageUrl(req: any, id: number): string {
  return `${req.protocol}://${req.get("host")}/images/${id}.jpg`;
}
