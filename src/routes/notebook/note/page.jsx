import { useParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

import { NoteEditor, NoteEditorSkeleton } from "@/components/note-editor";

import Notestore from "@/services/api/note-store";

const NotePage = () => {
    const params = useParams();
    const navigate = useNavigate();

    const notebook = useLiveQuery(() => Notestore.getNotebook(params.notebookId), [params.notebookId]);

    const note = useLiveQuery(async () => {
        const notesByNotebook = await Notestore.getNotesByNotebook(params.notebookId);

        if (notesByNotebook.length === 0) {
            throw new Response("", {
                status: 404,
                statusText: "Oops, page not found.",
            });
        }

        if (params.noteId) {
            const note = await Notestore.getNote(params.noteId);
            if (!note || note?.notebook_id !== params.notebookId) {
                throw new Response("", {
                    status: 404,
                    statusText: "Oops, note not found",
                });
            }

            return note;
        }
    }, [params.noteId, params.notebookId]);

    return (
        <section>
            {note ? (
                <NoteEditor
                    note={note}
                    onDelete={() => navigate(`/notebook/${notebook?.id}`)}
                />
            ) : (
                <NoteEditorSkeleton />
            )}
        </section>
    );
};

export default NotePage;
