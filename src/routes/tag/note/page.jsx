import { useParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

import { NoteEditor, NoteEditorSkeleton } from "@/components/note-editor";

import Notestore from "@/services/api/note-store";

const NoteTagPage = () => {
    const params = useParams();
    const navigate = useNavigate();

    const note = useLiveQuery(async () => {
        const notesByTag = await Notestore.getNotesByTag(params.tagId);

        if (notesByTag.length === 0) {
            navigate(`/tag/${params.tagId}`, { replace: true });
        }

        if (params.noteId) {
            const note = await Notestore.getNote(params.noteId);
            if (!note || !note.tag_ids.includes(params.tagId)) {
                navigate(`/tag/${params.tagId}`, { replace: true });
            }

            return note;
        }
    }, [params.noteId, params.tagId, navigate]);

    return (
        <section>
            {note ? (
                <NoteEditor
                    note={note}
                    onDelete={() => navigate(`/tag/${params.tagId}`)}
                />
            ) : (
                <NoteEditorSkeleton />
            )}
        </section>
    );
};

export default NoteTagPage;
