import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validate = (schema: AnyZodObject) => 
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await schema.safeParseAsync({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        if (result.success) {
            return next();
        } else {
            if (req.headers["accept"] === "application/xml") {
                // Convert validation errors to XML format if requested
                const xmlErrors = result.error.issues.map((issue) => {
                    return `<error><path>${issue.path.join(": ")}</path><message>${issue.message}</message></error>`;
                }).join("");
                return res.status(400).send(`<errors>${xmlErrors}</errors>`);
            }
            // Return validation errors in JSON format
            return res.status(400).json({
                message: "Validation failed",
                details: result.error.issues.map((issue) => {
                    return {
                        path: issue.path.join(": "),
                        message: issue.message,
                    };
            }),
            });
        }
    };