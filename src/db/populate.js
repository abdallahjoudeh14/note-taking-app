import db from "./db";
import { v4 as uuid } from "uuid";

export const populate = async () => {
    await db.notebooks.add({
        id: uuid(),
        name: "First Notebook",
        default_notebook: "true",
        view_preference: "card",
        created_at: Date.now(),
        updated_at: Date.now(),
    });
};
