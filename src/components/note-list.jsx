import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { Ellipsis, FilePlus2, GalleryVerticalEnd, LayoutPanelLeft, TableProperties } from "lucide-react";

import { formatDate } from "@/utils/format-date.util";

import Notestore from "@/services/api/note-store";

import PropTypes from "prop-types";

export const NoteList = ({
    initialTitle,
    notes,
    initialView = "card",
    titlePlaceholder,
    prefixNotePath = "",
    actionItems,
    isEditable,
    isEditing,
    onEditChange = () => {},
    onTitleChange = () => {},
    onPreviewChange = () => {},
    onCreateNote = () => {},
}) => {
    const navigate = useNavigate();
    const params = useParams();

    const [title, setTitle] = useState(initialTitle);
    const [view, setView] = useState(initialView);
    const [editing, setEditing] = useState(isEditing || false);

    const inputRef = useRef(null);

    const tags = useLiveQuery(async () => {
        let tagsByNote = {};

        if (notes) {
            for (let note of notes) {
                tagsByNote[note.id] = await Notestore.getTagsByNote(note.id);
            }
        }

        return tagsByNote;
    }, [notes]);

    const handleViewChange = (v) => {
        setView(v);
        onPreviewChange(v);
    };

    const enableInput = () => {
        setTitle(initialTitle);
        setEditing(true);
        onEditChange(true);
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 0);
    };

    const disableInput = () => {
        setEditing(false);
        onEditChange(false);
    };

    const onChange = (event) => {
        setTitle(event.target.value);
        onTitleChange(event.target.value.trim());
    };

    const onKeyDown = (event) => {
        if (event.key === "Escape" || event.key === "Enter") {
            disableInput();
        }
    };

    useEffect(() => {
        setView(initialView);
    }, [initialView]);

    useEffect(() => {
        if (isEditing) {
            enableInput();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    return (
        <section className="flex h-screen flex-col">
            <header className="p-4">
                {isEditable ? (
                    <>
                        {editing ? (
                            <Input
                                ref={inputRef}
                                value={title}
                                className="mb-4 max-w-[200px] p-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                                onChange={onChange}
                                onBlur={disableInput}
                                onKeyDown={onKeyDown}
                                placeholder={titlePlaceholder}
                            />
                        ) : (
                            <Button
                                variant="ghost"
                                className="mb-4 line-clamp-2 h-fit whitespace-normal p-1 text-start text-2xl font-medium"
                                onClick={enableInput}
                            >
                                {initialTitle}
                            </Button>
                        )}
                    </>
                ) : (
                    <h1 className="mb-4 line-clamp-2 text-2xl font-medium">{initialTitle}</h1>
                )}
                <div className="flex items-center justify-between">
                    <Label className="text-base text-muted-foreground">{`${notes?.length || 0} ${notes?.length > 1 ? "notes" : "note"}`}</Label>
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-8 p-0"
                                >
                                    <LayoutPanelLeft size={20} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuRadioGroup
                                    value={view}
                                    onValueChange={(value) => handleViewChange(value)}
                                >
                                    <DropdownMenuRadioItem value="card">
                                        <GalleryVerticalEnd
                                            size={16}
                                            className="mr-2"
                                        />
                                        Card
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="table">
                                        <TableProperties
                                            size={16}
                                            className="mr-2"
                                        />
                                        Table
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {actionItems && (
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
                                    onCloseAutoFocus={(event) => {
                                        event.preventDefault();
                                    }}
                                >
                                    {actionItems?.map((action) => (
                                        <DropdownMenuItem
                                            key={action.value}
                                            textValue={action.value}
                                            onSelect={action.onSelect}
                                            {...action.attributes}
                                        >
                                            {action.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </header>
            <div className="flex h-full w-full flex-col overflow-auto p-4 [scrollbar-width:_thin]">
                {notes?.length > 0 ? (
                    <>
                        {view === "card" ? (
                            <div className="flex w-full flex-col gap-y-2">
                                {notes?.map((note) => (
                                    <Card
                                        key={note.id}
                                        className={[
                                            "cursor-pointer select-none transition-colors hover:border-zinc-300 hover:bg-zinc-100/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/30",
                                            "focus:border-zinc-300 focus:bg-zinc-100/50 dark:focus:border-zinc-700 dark:focus:bg-zinc-800/30",
                                            "data-[state=selected]:border-zinc-300 data-[state=selected]:bg-zinc-100 data-[state=selected]:dark:border-zinc-700 data-[state=selected]:dark:bg-zinc-900",
                                        ]}
                                        data-state={note.id === params.noteId ? "selected" : ""}
                                        onClick={() => navigate(`${prefixNotePath}/${note.id}`)}
                                    >
                                        <CardHeader>
                                            <CardTitle className="w-full overflow-hidden text-ellipsis text-nowrap leading-normal">
                                                {note.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 break-words">{note.content}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-x-1 overflow-hidden">
                                                {tags &&
                                                    tags[note.id]?.map((tag) => (
                                                        <Badge
                                                            key={tag.id}
                                                            variant="secondary"
                                                            className="inline-block flex-[0_1_auto] overflow-hidden text-ellipsis whitespace-nowrap rounded"
                                                        >
                                                            {tag.name}
                                                        </Badge>
                                                    ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="sticky top-0 bg-background">
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Updated</TableHead>
                                        <TableHead>Tags</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notes?.map((note) => (
                                        <TableRow
                                            key={note.id}
                                            className="cursor-pointer select-none"
                                            onClick={() => navigate(`${prefixNotePath}/${note.id}`)}
                                            data-state={note.id === params.noteId ? "selected" : ""}
                                        >
                                            <TableCell className="max-w-[20ch] overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                                                {note.title}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap font-medium">{formatDate(note.created_at)}</TableCell>
                                            <TableCell className="whitespace-nowrap font-medium">{formatDate(note.updated_at)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-x-1 overflow-hidden">
                                                    {tags &&
                                                        tags[note.id]?.map((tag) => (
                                                            <Badge
                                                                key={tag.id}
                                                                variant="secondary"
                                                                className="inline-block flex-[0_1_auto] overflow-hidden text-ellipsis whitespace-nowrap rounded"
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-y-4">
                        <FilePlus2 size={42} />
                        <p className="text-center font-medium">
                            No notes found <br />
                            <Button
                                variant="link"
                                className="h-auto p-0 text-muted-foreground"
                                onClick={onCreateNote}
                            >
                                create new note
                            </Button>
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

NoteList.propTypes = {
    initialTitle: PropTypes.string,
    notes: PropTypes.arrayOf(PropTypes.object),
    initialView: PropTypes.oneOf(["card", "table"]),
    titlePlaceholder: PropTypes.string,
    prefixNotePath: PropTypes.string,
    isEditable: PropTypes.bool,
    isEditing: PropTypes.bool,
    onEditChange: PropTypes.func,
    actionItems: PropTypes.arrayOf(PropTypes.object),
    onTitleChange: PropTypes.func,
    onPreviewChange: PropTypes.func,
    onCreateNote: PropTypes.func,
};

export const NoteListSkeleton = () => {
    return (
        <section>
            <header className="p-4">
                <Skeleton className="mb-4 h-7 w-40" />

                <Skeleton className="h-7 w-20" />
            </header>
            <div className="flex flex-col gap-y-2 p-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        </section>
    );
};
