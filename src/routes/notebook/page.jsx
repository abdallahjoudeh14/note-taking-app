import { useState } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@uidotdev/usehooks";
import { useLiveQuery } from "dexie-react-hooks";
import { useModel } from "@/hooks/use-model";

import { toast } from "sonner";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { NoteList, NoteListSkeleton } from "@/components/note-list";
import { AlertModel } from "@/components/alert-model";

import db from "@/db/db";
import Notestore from "@/services/api/note-store";

const NotebookPage = () => {
    const params = useParams();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);

    const alertModel = useModel();

    const defaultNotebook = useLiveQuery(() => Notestore.getDefaultNotebook(), []);

    const notebook = useLiveQuery(async () => {
        const notebook = await Notestore.getNotebook(params.notebookId);

        if (!notebook) {
            throw new Response("", {
                status: 404,
                statusText: "Oops, notebook not found.",
            });
        }

        return notebook;
    }, [params.notebookId]);

    const notesByNotebook = useLiveQuery(async () => {
        const notesByNotebook = await Notestore.getNotesByNotebook(params.notebookId);

        if (notesByNotebook && notesByNotebook.length > 0 && !params.noteId) {
            navigate(`note/${notesByNotebook[0].id}`, { replace: true });
        }

        return notesByNotebook;
    }, [params.notebookId, params.noteId, navigate]);

    const handleCreateNote = async () => {
        const promise = Notestore.createNote({
            notebook_id: params.notebookId || defaultNotebook.id,
            title: "Untitled",
            content: "",
        });

        toast.promise(promise, {
            loading: "Creating a new note...",
            success: "New note created!",
            error: "Failed to create a note.",
        });

        promise.then((result) => {
            if (result) Notestore.updateNotebook(params.notebookId, { updated_at: Date.now() });
        });
    };

    const handleDeleteNotebook = async () => {
        if (params.notebookId !== defaultNotebook.id) {
            navigate("/notebook", { replace: true });

            const promise = Notestore.deleteNotebook(params.notebookId);
            toast.promise(promise, {
                loading: "Deleting notebook...",
                success: `"${notebook?.name.length > 8 ? notebook?.name.substring(0, 9) + "..." : notebook?.name}" deleted.`,
                error: "Failed to delete the notebook.",
            });
        }
    };

    const handleSetAsDefaultNotebook = async () => {
        try {
            await db.transaction("rw", db.notebooks, async () => {
                await Notestore.updateNotebook(defaultNotebook?.id, { default_notebook: "false" });
                await Notestore.updateNotebook(params.notebookId, { default_notebook: "true" });
            });
            toast.success(`${notebook?.name} set as default!`);
        } catch (error) {
            toast.error("Failed to set the notebook as default.");
        }
    };

    useDocumentTitle(notebook?.name ? `${notebook.name} - Noting` : "Not found");

    const actions = [
        { label: "Add new note", value: "create", onSelect: handleCreateNote },
        {
            label: "Rename notebook",
            value: "rename",
            onSelect: () => {
                setIsEditing(true);
            },
        },
        {
            label: "Delete notebook",
            value: "delete",
            attributes: { disabled: params.notebookId === defaultNotebook?.id },
            onSelect: () => {
                alertModel.onOpen();
            },
        },
    ];

    if (params.notebookId !== defaultNotebook?.id) {
        actions.push({
            label: "Set as default notebook",
            value: "set as default",
            onSelect: handleSetAsDefaultNotebook,
        });
    }

    return (
        <>
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
                            {notebook === undefined || !notesByNotebook ? (
                                <NoteListSkeleton />
                            ) : (
                                <NoteList
                                    initialTitle={notebook?.name}
                                    notes={notesByNotebook}
                                    titlePlaceholder="Notebook"
                                    prefixNotePath="note"
                                    initialView={notebook?.view_preference}
                                    isEditable={true}
                                    isEditing={isEditing}
                                    onEditChange={(editing) => setIsEditing(editing)}
                                    onTitleChange={(title) =>
                                        Notestore.updateNotebook(params.notebookId, { name: title || "Notebook", updated_at: Date.now() })
                                    }
                                    onPreviewChange={(preview) => Notestore.updateNotebook(params.notebookId, { view_preference: preview })}
                                    onCreateNote={handleCreateNote}
                                    actionItems={actions}
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

            <AlertModel
                titleText={`Are you sure you want to delete "${notebook?.name}" notebook?`}
                descriptionText="This action cannot be undone. It will permanently delete your notebook and all notes associated with it."
                cancelText="Cancel"
                actionText="Yes, delete notebook"
                isOpen={alertModel.isOpen}
                onClose={alertModel.onClose}
                onAction={handleDeleteNotebook}
            />
        </>
    );
};

export default NotebookPage;
