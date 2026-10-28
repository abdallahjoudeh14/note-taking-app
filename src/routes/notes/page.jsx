import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useDocumentTitle } from "@uidotdev/usehooks";

import { toast } from "sonner";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { NoteList, NoteListSkeleton } from "@/components/note-list";
import { NoteEditor, NoteEditorSkeleton } from "@/components/note-editor";

import Notestore from "@/services/api/note-store";

const NotesPage = () => {
    const navigate = useNavigate();
    const params = useParams();

    const notes = useLiveQuery(async () => {
        const notes = await Notestore.getNotes();
        if (notes && notes.length > 0 && !params.noteId) {
            navigate(`${notes[0].id}`, { replace: true });
        }
        return notes;
    }, [params.noteId, navigate]);

    const note = useLiveQuery(() => params.noteId && Notestore.getNote(params.noteId), [params.noteId]);

    const handleCreateNote = async () => {
        const defaultNotebook = await Notestore.getDefaultNotebook();

        const promise = Notestore.createNote({
            notebook_id: defaultNotebook.id,
            title: "Untitled",
            content: "",
        });

        toast.promise(promise, {
            loading: "Creating a new note...",
            success: "New note created!",
            error: "Failed to create a note.",
        });

        promise.then((result) => {
            if (result) Notestore.updateNotebook(defaultNotebook.id, { updated_at: Date.now() });
        });
    };

    useDocumentTitle("Notes - Noting");

    return (
        <ResizablePanel
            id="notebook-panel"
            order={2}
        >
            <ResizablePanelGroup
                direction="horizontal"
                autoSaveId="child-layout"
            >
                <ResizablePanel
                    id="notes-panel"
                    order={1}
                    defaultSize={25}
                    minSize={25}
                    maxSize={60}
                >
                    {!notes ? (
                        <NoteListSkeleton />
                    ) : (
                        <NoteList
                            initialTitle="Notes"
                            notes={notes}
                            prefixNotePath="../notes"
                            onCreateNote={handleCreateNote}
                        />
                    )}
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel
                    id="note-panel"
                    order={2}
                    defaultSize={75}
                    minSize={40}
                    maxSize={75}
                >
                    {params.noteId && (
                        <>
                            {note ? (
                                <NoteEditor
                                    note={note}
                                    onDelete={() => navigate(`/notes`, { replace: true })}
                                />
                            ) : (
                                <NoteEditorSkeleton />
                            )}
                        </>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </ResizablePanel>
    );
};

export default NotesPage;
