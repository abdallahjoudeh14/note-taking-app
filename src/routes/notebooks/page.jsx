import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useDocumentTitle } from "@uidotdev/usehooks";
import { useModel } from "@/hooks/use-model";

import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ResizablePanel } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertModel } from "@/components/alert-model";

import { Ellipsis, Notebook, PlusCircle } from "lucide-react";
import { FavNotebook } from "@/assets/icons/fav-notebook";

import { formatDate } from "@/utils/format-date.util";

import db from "@/db/db";
import Notestore from "@/services/api/note-store";

const NotebooksPage = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [isEditing, setIsEditing] = useState({});
    const [notebookId, setNotebookId] = useState("");
    const [operation, setOperation] = useState("");

    const inputRef = useRef(null);

    const alertModel = useModel();

    const notebooks = useLiveQuery(() => Notestore.getNotebooks(), []);
    const defaultNotebook = useLiveQuery(() => Notestore.getDefaultNotebook(), []);

    const enableInput = (notebook) => {
        setTitle(notebook.name);
        setIsEditing({ [notebook.id]: true });
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 0);
    };

    const disableInput = () => {
        let newObj = { ...isEditing };
        for (let key in newObj) {
            if (newObj[key] === true) {
                newObj[key] = false;
            }
        }

        setIsEditing(newObj);
    };

    const onChange = async (event, notebookId) => {
        setTitle(event.target.value);
        await Notestore.updateNotebook(notebookId, { name: event.target.value || "Notebook", updated_at: Date.now() });
    };

    const onKeyDown = (event) => {
        if (event.key === "Escape" || event.key === "Enter") {
            disableInput();
        }
    };

    const handleCreateNotebook = () => {
        const promise = Notestore.createNotebook({ name: "Notebook" });
        toast.promise(promise, {
            loading: "Creating a new notebook...",
            success: "New notebook created!",
            error: "Failed to create a notebook.",
        });
    };

    const handleCreateNote = async (notebookId) => {
        const defaultNotebook = await Notestore.getDefaultNotebook();

        const promise = Notestore.createNote({
            notebook_id: notebookId || defaultNotebook.id,
            title: "Untitled",
            content: "",
        });

        toast.promise(promise, {
            loading: "Creating a new note...",
            success: "New note created!",
            error: "Failed to create a note.",
        });

        promise.then((result) => {
            if (result) {
                Notestore.updateNotebook(notebookId, { updated_at: Date.now() });
                navigate(`/notebook/${notebookId}/note/${result}`, { replace: true });
            }
        });
    };

    const handleDeleteNotebook = async (notebookId) => {
        const notebook = await Notestore.getNotebook(notebookId);

        if (notebookId !== defaultNotebook.id) {
            const promise = Notestore.deleteNotebook(notebookId);

            toast.promise(promise, {
                loading: "Deleting notebook...",
                success: `"${notebook?.name.length > 8 ? notebook?.name.substring(0, 9) + "..." : notebook?.name}" deleted.`,
                error: "Failed to delete the notebook.",
            });
        }
    };

    const handleSetAsDefaultNotebook = async (notebookId) => {
        const notebook = await Notestore.getNotebook(notebookId);

        try {
            await db.transaction("rw", db.notebooks, async () => {
                await Notestore.updateNotebook(defaultNotebook?.id, { default_notebook: "false" });
                await Notestore.updateNotebook(notebookId, { default_notebook: "true" });
            });
            toast.success(`${notebook?.name} set as default!`);
        } catch (error) {
            toast.error("Failed to set the notebook as default.");
        }
    };

    useDocumentTitle("Notebooks - Noting");

    return (
        <>
            <ResizablePanel
                id="notebook-panel"
                order={2}
            >
                <div className="flex flex-col gap-y-8 p-4">
                    <header>
                        <h1 className="text-2xl font-semibold">Notebooks</h1>
                    </header>
                    <div className="flex justify-between">
                        <Label className="text-base text-muted-foreground">{`${notebooks?.length || 0} ${notebooks?.length > 1 ? "notebooks" : "notebook"}`}</Label>
                        <Button
                            className="gap-x-2"
                            onClick={handleCreateNotebook}
                        >
                            <PlusCircle size={20} /> New notebook
                        </Button>
                    </div>
                    <main>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Created at</TableHead>
                                    <TableHead>Updated at</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="whitespace-nowrap font-medium">
                                {notebooks?.map((notebook) => (
                                    <TableRow key={notebook.id}>
                                        <TableCell
                                            onClick={() => !isEditing[notebook.id] && navigate(`/notebook/${notebook.id}`)}
                                            className="group flex h-16 w-fit cursor-pointer items-center gap-x-2"
                                        >
                                            {notebook.default_notebook === "true" ? <FavNotebook size={20} /> : <Notebook size={20} />}
                                            {isEditing[notebook.id] ? (
                                                <Input
                                                    ref={inputRef}
                                                    value={title}
                                                    className="h-7 w-fit px-2"
                                                    onChange={(event) => onChange(event, notebook.id)}
                                                    onBlur={disableInput}
                                                    onKeyDown={onKeyDown}
                                                    placeholder="Notebook"
                                                />
                                            ) : (
                                                <p className="group-hover:underline">{notebook.name}</p>
                                            )}
                                        </TableCell>
                                        <TableCell>{formatDate(notebook.created_at)}</TableCell>
                                        <TableCell>{formatDate(notebook.updated_at)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="size-8 p-0"
                                                    >
                                                        <Ellipsis size={20} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="start"
                                                    onClick={(event) => event.stopPropagation()}
                                                    onCloseAutoFocus={(event) => {
                                                        event.preventDefault();
                                                        if (operation === "rename") enableInput(notebook);
                                                    }}
                                                >
                                                    <DropdownMenuItem
                                                        textValue="new note"
                                                        onSelect={(event) => {
                                                            event.stopPropagation();
                                                            setOperation("create");
                                                            handleCreateNote(notebook.id);
                                                        }}
                                                    >
                                                        Add new note
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        textValue="rename notebook"
                                                        onSelect={(event) => {
                                                            event.stopPropagation();
                                                            setOperation("rename");
                                                            // enableInput(notebook);
                                                        }}
                                                    >
                                                        Rename notebook
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        textValue="delete notebook"
                                                        onSelect={(event) => {
                                                            event.stopPropagation();
                                                            setOperation("delete");
                                                            setNotebookId(notebook.id);
                                                            alertModel.onOpen();
                                                        }}
                                                        disabled={notebook.id === defaultNotebook?.id}
                                                    >
                                                        Delete notebook
                                                    </DropdownMenuItem>
                                                    {notebook.id !== defaultNotebook?.id && (
                                                        <DropdownMenuItem
                                                            textValue="set as default notebook"
                                                            onSelect={(event) => {
                                                                event.stopPropagation();
                                                                setOperation("set as default");
                                                                handleSetAsDefaultNotebook(notebook.id);
                                                            }}
                                                        >
                                                            Set as default notebook
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </main>
                </div>
            </ResizablePanel>

            <AlertModel
                titleText={`Are you sure you want to delete notebook?`}
                descriptionText="This action cannot be undone. It will permanently delete your notebook and all notes associated with it."
                cancelText="Cancel"
                actionText="Yes, delete notebook"
                isOpen={alertModel.isOpen}
                onClose={alertModel.onClose}
                onAction={() => handleDeleteNotebook(notebookId)}
            />
        </>
    );
};

export default NotebooksPage;
