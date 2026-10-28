import { useState } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useDocumentTitle } from "@uidotdev/usehooks";

import { toast } from "sonner";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { NoteList, NoteListSkeleton } from "@/components/note-list";

import Notestore from "@/services/api/note-store";

const TagPage = () => {
    const [isEditing, setIsEditing] = useState(false);

    const params = useParams();
    const navigate = useNavigate();

    const tag = useLiveQuery(async () => {
        const tag = await Notestore.getTag(params.tagId);

        if (!tag) {
            throw new Response("", {
                status: 404,
                statusText: "Oops, tag not found.",
            });
        }

        return tag;
    }, [params.tagId]);

    const notesByTag = useLiveQuery(async () => {
        const notesByTag = await Notestore.getNotesByTag(params.tagId);

        if (notesByTag && notesByTag.length > 0 && !params.noteId) {
            navigate(`note/${notesByTag[0].id}`, { replace: true });
        }

        return notesByTag;
    }, [params.tagId, params.noteId, navigate]);

    const handleCreateNote = async () => {
        const defaultNotebook = await Notestore.getDefaultNotebook();

        const promise = Notestore.createNote({
            notebook_id: defaultNotebook.id,
            title: "Untitled",
            content: "",
            tag_ids: [params.tagId],
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

    useDocumentTitle(`${tag?.name} - Noting`);

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
                    <div>
                        {tag === undefined || !notesByTag ? (
                            <NoteListSkeleton />
                        ) : (
                            <NoteList
                                initialTitle={tag?.name}
                                notes={notesByTag}
                                initialView="card"
                                titlePlaceholder={tag?.name}
                                prefixNotePath="note"
                                isEditable={true}
                                isEditing={isEditing}
                                onEditChange={(editing) => setIsEditing(editing)}
                                onTitleChange={(title) => Notestore.updateTag(params.tagId, { name: title || tag.name })}
                                onCreateNote={handleCreateNote}
                                actionItems={[
                                    {
                                        label: "Add new note",
                                        value: "create",
                                        onSelect: handleCreateNote,
                                    },
                                    {
                                        label: "Rename tag",
                                        value: "rename",
                                        onSelect: () => setIsEditing(true),
                                    },
                                ]}
                            />
                        )}
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel
                    id="note-panel"
                    order={2}
                    defaultSize={75}
                    minSize={40}
                    maxSize={75}
                >
                    <Outlet />
                </ResizablePanel>
            </ResizablePanelGroup>
        </ResizablePanel>
    );
};

export default TagPage;
