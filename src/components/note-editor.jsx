import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useModel } from "@/hooks/use-model";

import { toast } from "sonner";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { OptionSelect } from "@/components/option-select";
import { Textarea } from "@/components/textarea";
import { AlertModel } from "@/components/alert-model";
import { MoveCopyModel } from "@/components/move-copy-model";
import { NoteInfoModel } from "@/components/note-info-model";

import { ClipboardPaste, Ellipsis, File, FileInput, Info, Notebook, Trash2 } from "lucide-react";
import { FavNotebook } from "@/assets/icons/fav-notebook";

import Notestore from "@/services/api/note-store";

import PropTypes from "prop-types";

export const NoteEditor = ({ note, onDelete = () => {} }) => {
    const [operation, setOperation] = useState("");

    const titleTextAreaRef = useRef(null);
    const contentTextAreaRef = useRef(null);

    const navigate = useNavigate();

    const alertModel = useModel();
    const moveCopyModel = useModel();
    const noteInfoModel = useModel();

    const notebooks = useLiveQuery(() => Notestore.getNotebooks(), []);
    const notebook = useLiveQuery(() => Notestore.getNotebook(note?.notebook_id), [note?.notebook_id]);

    const tags = useLiveQuery(() => Notestore.getTags(), []);
    const selectedTags = useLiveQuery(() => note && Notestore.getTagsByNote(note.id), [note?.id]);

    const handleCreateTag = async (name) => {
        const tagId = await Notestore.createTag({ name });
        const newSelectedTagIds = [...selectedTags.map((tag) => tag.id), tagId];
        Notestore.updateNote(note?.id, { tag_ids: newSelectedTagIds });
    };

    const handleSelectTag = (tags) => {
        const newSelectedTagIds = tags.map((tag) => tag.value);
        Notestore.updateNote(note?.id, { tag_ids: newSelectedTagIds });
    };

    const handleMoveNote = (noteId, notebookId) => {
        const promise = Notestore.updateNote(noteId, { notebook_id: notebookId });
        toast.promise(promise, {
            loading: "Moving note...",
            success: "Note moved successfully.",
            error: "Failed to move note.",
        });

        promise.then((result) => {
            if (result) Notestore.updateNotebook(notebookId, { updated_at: Date.now() });
        });

        navigate(`/notebook/${notebookId}/note/${noteId}`);
    };

    const handleCopyNote = (notebookId) => {
        const promise = Notestore.createNote({
            notebook_id: notebookId,
            title: note.title,
            content: note.content,
            tag_ids: note.tag_ids,
        });

        toast.promise(promise, {
            loading: "Copying note...",
            success: "Note copied successfully.",
            error: "Failed to copy note.",
        });

        promise.then((result) => {
            if (result) Notestore.updateNotebook(notebookId, { updated_at: Date.now() });
        });
    };

    const handleDeleteNote = (noteId) => {
        const promise = Notestore.deleteNote(noteId);

        toast.promise(promise, {
            loading: "Deleting note...",
            success: `"${note?.title.length > 8 ? note?.title.substring(0, 9) + "..." : note?.title}" deleted successfully.`,
            error: "Failed to delete note.",
        });

        onDelete();
    };

    return (
        <>
            <div className="flex h-screen flex-col">
                <header className="flex flex-col gap-2 p-4">
                    <div className="flex w-full items-center justify-between">
                        {note && notebook && (
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink
                                            onClick={() => navigate(`/notebook/${note.notebook_id}/note/${note.id}`)}
                                            className="flex cursor-pointer gap-x-1.5"
                                        >
                                            {notebook?.default_notebook == "true" ? <FavNotebook size={18} /> : <Notebook size={18} />}
                                            {notebook?.name}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <File
                                            size={18}
                                            className="flex-shrink-0"
                                        />
                                        <p className="w-full max-w-[40ch] overflow-hidden text-ellipsis text-nowrap">{note?.title}</p>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="ml-auto size-8 p-0"
                                >
                                    <Ellipsis size={20} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-48"
                            >
                                <DropdownMenuItem
                                    onSelect={() => {
                                        moveCopyModel.onOpen();
                                        setOperation("move");
                                    }}
                                >
                                    <FileInput
                                        size={16}
                                        className="mr-2"
                                    />
                                    Move
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() => {
                                        moveCopyModel.onOpen();
                                        setOperation("copy");
                                    }}
                                >
                                    <ClipboardPaste
                                        size={16}
                                        className="mr-2"
                                    />
                                    Copy to
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => noteInfoModel.onOpen()}>
                                    <Info
                                        size={16}
                                        className="mr-2"
                                    />
                                    Note Info
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="!text-red-500"
                                    onSelect={() => alertModel.onOpen()}
                                >
                                    <Trash2
                                        size={16}
                                        className="mr-2"
                                    />
                                    Delete note
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <OptionSelect
                        options={tags?.map((tag) => ({ value: tag.id, label: tag.name }))}
                        selectedOptions={selectedTags?.map((tag) => ({ value: tag.id, label: tag.name }))}
                        maxOptionsDisplay={4}
                        text="Add tag..."
                        placeholder="Type to add..."
                        onCreateOption={handleCreateTag}
                        onChange={handleSelectTag}
                    />
                </header>
                <Separator />
                <main className="flex h-full flex-col gap-y-8 overflow-y-auto overflow-x-hidden px-16 py-6">
                    <Textarea
                        ref={titleTextAreaRef}
                        key={`title-${note?.id}`}
                        id="note-title"
                        className="text-3xl font-semibold leading-normal"
                        initialValue={note?.title}
                        onValueChange={(title) => Notestore.updateNote(note?.id, { title: title || "Untitled", updated_at: Date.now() })}
                        placeholder="Untitled"
                        maxlength={200}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === "Tab") {
                                event.preventDefault();
                                contentTextAreaRef.current.focus();
                                contentTextAreaRef.current.setSelectionRange(
                                    contentTextAreaRef.current.value.length,
                                    contentTextAreaRef.current.value.length,
                                );
                            }
                        }}
                    />
                    <Textarea
                        ref={contentTextAreaRef}
                        key={`content-${note?.id}`}
                        id="note-content"
                        className="text-base font-normal leading-normal"
                        initialValue={note?.content}
                        onValueChange={(content) => Notestore.updateNote(note?.id, { content, updated_at: Date.now() })}
                        placeholder="Start typing..."
                        onKeyDown={(event) => {
                            if (event.key === "Backspace" && event.target.value === "") {
                                event.preventDefault();
                                titleTextAreaRef?.current.focus();
                                titleTextAreaRef?.current.setSelectionRange(
                                    titleTextAreaRef?.current.value.length,
                                    titleTextAreaRef?.current.value.length,
                                );
                            }
                        }}
                    />
                </main>
            </div>
            <AlertModel
                titleText="Are you sure you want to delete this note?"
                descriptionText="This action cannot be undone."
                cancelText="Cancel"
                actionText="Yes, delete note"
                onAction={() => handleDeleteNote(note?.id)}
                isOpen={alertModel.isOpen}
                onClose={alertModel.onClose}
            />
            <MoveCopyModel
                title={operation === "move" ? "Move note" : "Copy note"}
                isOpen={moveCopyModel.isOpen}
                onClose={moveCopyModel.onClose}
                notebooks={notebooks}
                activeNotebookId={note?.notebook_id}
                command={(notebookId) => (operation === "move" ? handleMoveNote(note?.id, notebookId) : handleCopyNote(notebookId))}
            />
            <NoteInfoModel
                isOpen={noteInfoModel.isOpen}
                onClose={noteInfoModel.onClose}
                note={note}
            />
        </>
    );
};

NoteEditor.propTypes = {
    note: PropTypes.object,
    onDelete: PropTypes.func,
};

export const NoteEditorSkeleton = () => {
    return (
        <div>
            <header className="p-4">
                <Skeleton className="h-7 w-44" />
                <div className="h-6"></div>
            </header>
            <main className="flex flex-col gap-y-8 px-16 py-6">
                <Skeleton className="h-9 w-64" />
                <div className="flex flex-col gap-y-4">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-1/2" />
                </div>
            </main>
        </div>
    );
};
