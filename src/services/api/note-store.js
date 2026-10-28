import db from "@/db/db";
import { v4 as uuid } from "uuid";

const Notestore = {
    /**
     * Retrieves a notebook by ID.
     * @param {string} id - The ID of the notebook.
     * @returns {Promise<object>} The notebook object.
     */
    getNotebook: async (id) => {
        return await db.notebooks.where("id").equals(id).first();
    },

    /**
     * Retrieves the default notebook.
     * @returns {Promise<object>} The default notebook object.
     */
    getDefaultNotebook: async () => {
        return await db.notebooks.where("default_notebook").equals("true").first();
    },

    /**
     * Retrieves all notebooks.
     * @returns {Promise<Array<object>>} Array of notebook objects.
     */
    getNotebooks: async () => {
        return await db.notebooks.orderBy("created_at").toArray();
    },

    /**
     * Creates a new notebook.
     * @param {object} params - Parameters for creating the notebook.
     * @param {string} params.name - The name of the notebook.
     * @returns {Promise<string>} The ID of the newly created notebook.
     */
    createNotebook: async ({ name }) => {
        return await db.notebooks.add({
            id: uuid(),
            name,
            default_notebook: false,
            view_preference: "card",
            created_at: Date.now(),
            updated_at: Date.now(),
        });
    },

    /**
     * Updates an existing notebook with the given changes.
     * @param {string} id - The ID of the notebook to update.
     * @param {object} changes - The changes to apply to the notebook.
     * @returns {Promise<number>} The number of updated entries (1 if successful, 0 if not).
     */
    updateNotebook: async (id, changes) => {
        return await db.notebooks.update(id, changes);
    },

    /**
     * Deletes a notebook by ID.
     * @param {string} id - The ID of the notebook to delete.
     * @returns {Promise<void>} A promise that resolves when the notebook is deleted.
     */
    deleteNotebook: async (id) => {
        const notes = await Notestore.getNotesByNotebook(id);

        for (const note of notes) {
            Notestore.deleteNote(note.id);
        }

        await db.notebooks.delete(id);
    },

    /**
     * Retrieves a note by ID.
     * @param {string} id - The ID of the note.
     * @returns {Promise<object>} The note object.
     */
    getNote: async (id) => {
        return await db.notes.where("id").equals(id).first();
    },

    /**
     * Retrieves all notes.
     * @returns {Promise<Array<object>>} Array of note objects.
     */
    getNotes: async () => {
        return await db.notes.reverse().sortBy("updated_at");
    },

    /**
     * Retrieves all notes belonging to a specific notebook.
     * @param {string} id - The ID of the notebook.
     * @returns {Array<object>} Array of note objects.
     */
    getNotesByNotebook: async (id) => {
        return await db.notes.where("notebook_id").equals(id).reverse().sortBy("updated_at");
    },

    /**
     * Retrieves all notes associated with a specific tag.
     * @param {string} id - The ID of the tag.
     * @returns {Array<object>} Array of note objects.
     */
    getNotesByTag: async (id) => {
        return await db.notes
            .filter((note) => note.tag_ids.includes(id))
            .reverse()
            .sortBy("updated_at");
    },

    /**
     * Creates a new note.
     * @param {object} params - Parameters for creating the note.
     * @param {string} params.notebook_id - The ID of the notebook to which the note belongs.
     * @param {string} params.title - The title of the note.
     * @param {string} params.content - The content of the note.
     * @param {Array<string>} [params.tag_ids=[]] - Array of tag IDs associated with the note.
     * @returns {Promise<string>} The ID of the newly created note.
     */
    createNote: async ({ notebook_id, title, content, tag_ids = [] }) => {
        return await db.notes.add({
            id: uuid(),
            notebook_id,
            title,
            content,
            tag_ids: tag_ids,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
    },

    /**
     * Updates an existing note.
     * @param {string} id - The ID of the note.
     * @param {object} changes - The changes to apply to the note.
     * @returns {void}
     */
    updateNote: async (id, changes) => {
        return await db.notes.update(id, changes);
    },

    /**
     * Deletes a note by ID.
     * @param {string} id - The ID of the note to delete.
     * @returns {void}
     */
    deleteNote: async (id) => {
        await db.notes.delete(id);
    },

    /**
     * Retrieves a tag by ID.
     * @param {string} id - The ID of the tag.
     * @returns {Promise<object>} The tag object.
     */
    getTag: async (id) => {
        return await db.tags.where("id").equals(id).first();
    },

    /**
     * Retrieves all tags.
     * @returns {Promise<Array<object>>} Array of tag objects.
     */
    getTags: async () => {
        return await db.tags.orderBy("created_at").toArray();
    },

    /**
     * Retrieves all tags associated with a specific note.
     * @param {string} id - The ID of the note.
     * @returns {Promise<Array<object>>} Array of tag objects.
     */
    getTagsByNote: async (id) => {
        const noteTags = await db.notes.where("id").equals(id).first();

        return await db.tags
            .filter((tag) => noteTags?.tag_ids?.includes(tag.id))
            .reverse()
            .sortBy("created_at");
    },

    /**
     * Creates a new tag.
     * @param {object} params - Parameters for creating the tag.
     * @param {string} params.name - The name of the tag.
     * @returns {Promise<string>} The ID of the newly created tag.

     */
    createTag: async ({ name }) => {
        return await db.tags.add({ id: uuid(), name, created_at: Date.now() });
    },

    /**
     * Updates an existing tag.
     * @param {string} id - The ID of the tag.
     * @param {object} changes - The changes to apply to the tag.
     * @returns {void}
     */
    updateTag: async (id, changes) => {
        return await db.tags.update(id, changes);
    },

    /**
     * Deletes a tag by ID.
     * @param {string} id - The ID of the tag to delete.
     * @returns {void}
     */
    deleteTag: async (id) => {
        return await db.tags.delete(id);
    },
};

export default Notestore;
