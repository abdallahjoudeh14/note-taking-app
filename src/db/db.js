import Dexie from "dexie";
import { populate } from "./populate";

const db = new Dexie("noting_db");

db.version(1).stores({
    notebooks: "&id,name,default_notebook,view_preference,created_at,updated_at",
    notes: "&id,notebook_id,title,*tag_ids,created_at,updated_at",
    tags: "&id,&name,created_at",
});

db.on("populate", populate);

export default db;
