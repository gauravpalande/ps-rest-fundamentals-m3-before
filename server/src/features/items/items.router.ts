import express from "express";
import { get } from "http";
import { getItemDetail, getItems } from "./items.service";

export const itemsRouter = express.Router();

itemsRouter.get("/", async (req, res) => {
  const items = await getItems();
  items.forEach((item) => {
    item.imageUrl = buildImageUrl(req, item.id);
  });
  res.json(items);
});

itemsRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item  = await getItemDetail(id);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  item.imageUrl = buildImageUrl(req, item.id);
  res.json(item);
}
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function buildImageUrl(req: any, id: number): string {
  return `${req.protocol}://${req.get("host")}/images/${id}.jpg`;
}
