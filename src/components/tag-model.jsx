import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { MoreHorizontal, Tag, TextCursorInput, Trash2 } from "lucide-react";

import Notestore from "@/services/api/note-store";

import PropTypes from "prop-types";

export const TagModel = ({ isOpen, onClose, tags }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [search, setSearch] = useState("");
    const [tagName, setTagName] = useState("");
    const [defaultTagName, setDefaultTagName] = useState("");
    const [isEditing, setIsEditing] = useState({});
    const [operation, setOperation] = useState("");

    const inputRef = useRef(null);

    const handleCreateTag = (name) => {
        const promise = Notestore.createTag({ name });
        toast.promise(promise, {
            loading: "Creating a new tag...",
            success: "New tag created!",
            error: (error) => {
                if (error.name === "ConstraintError") return "The name of the tag must be unique.";
                return "Failed to create a tag.";
            },
        });
    };

    const handleUpdateTag = (id, name) => {
        const promise = Notestore.updateTag(id, { name });
        toast.promise(promise, {
            error: (error) => {
                if (error.failures[0].name === "ConstraintError") return "The name of the tag should be unique.";
                return "Failed to update a tag.";
            },
        });
    };

    const handleDeleteTag = async (id) => {
        const tag = await Notestore.getTag(id);
        if (tag) {
            const promise = Notestore.deleteTag(tag.id);

            toast.promise(promise, {
                success: "Tag has been deleted.",
                error: "Failed to delete a tag.",
            });

            const tagPathRegex = /tag/;

            if (tagPathRegex.test(location.pathname)) {
                navigate("/");
            }
        }
    };

    const runCommand = (command) => {
        if (typeof command === "function") command();
        onClose();
    };

    const enableInput = (tag) => {
        setTagName(tag.name);
        setDefaultTagName(tag.name);
        setIsEditing({ [tag.id]: true });
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

    const onChange = (event, id) => {
        setTagName(event.target.value);
        handleUpdateTag(id, event.target.value.trim() || defaultTagName.trim());
    };

    const onKeyDown = (event) => {
        if (event.key === "Escape" || event.key === "Enter") {
            disableInput();
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={onClose}
        >
            <DialogContent
                onEscapeKeyDown={(event) => {
                    if (Object.values(isEditing).includes(true)) event.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle>
                        <p className="pb-4 text-xl">Tags</p>
                    </DialogTitle>
                    <Separator />
                </DialogHeader>

                <Command
                    loop
                    className={[
                        "overflow-visible rounded-none",
                        "[&_[cmdk-input-wrapper]:has(:focus-visible)]:has-[:focus-visible]:ring-2 [&_[cmdk-input-wrapper]:has(:focus-visible)]:has-[:focus-visible]:ring-zinc-950 [&_[cmdk-input-wrapper]:has(:focus-visible)]:has-[:focus-visible]:ring-offset-2 dark:[&_[cmdk-input-wrapper]:has(:focus-visible)]:has-[:focus-visible]:ring-zinc-300 [&_[cmdk-input-wrapper]]:h-11 [&_[cmdk-input-wrapper]]:w-full [&_[cmdk-input-wrapper]]:rounded-md [&_[cmdk-input-wrapper]]:border [&_[cmdk-input-wrapper]]:border-zinc-200 [&_[cmdk-input-wrapper]]:ring-offset-white dark:[&_[cmdk-input-wrapper]]:border-zinc-800 dark:[&_[cmdk-input-wrapper]]:ring-offset-zinc-950",
                        "[&_[cmdk-list]]:mt-4",
                    ]}
                >
                    <div className="flex w-full gap-x-2">
                        <CommandInput
                            value={search}
                            onValueChange={(value) => setSearch(value)}
                            placeholder="Find or create a tag..."
                        />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-11 w-11 flex-shrink-0 p-0"
                                    onClick={() => {
                                        if (search.length) {
                                            handleCreateTag(search);
                                            setSearch("");
                                        } else toast.error("Tag name must not be empty.");
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            if (search.length) {
                                                handleCreateTag(search);
                                                setSearch("");
                                            } else toast.error("Tag name must not be empty.");
                                        }
                                    }}
                                >
                                    <Tag size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Create new tag</TooltipContent>
                        </Tooltip>
                    </div>
                    <CommandList>
                        <Label className="mb-2 block text-sm font-medium text-muted-foreground">{`${tags?.length} ${tags?.length > 1 ? "Tags" : "Tag"}`}</Label>
                        <CommandEmpty>No tags found.</CommandEmpty>
                        <CommandGroup>
                            {tags?.map((tag) => (
                                <CommandItem
                                    key={tag.id}
                                    value={tag.name}
                                    onSelect={() => {
                                        if (!isEditing[tag.id]) runCommand(() => navigate(`tag/${tag.id}`));
                                    }}
                                >
                                    <Tag
                                        size={20}
                                        className="mr-2"
                                    />
                                    {isEditing[tag.id] ? (
                                        <Input
                                            ref={inputRef}
                                            value={tagName}
                                            onChange={(event) => onChange(event, tag.id)}
                                            className="h-7 w-fit px-2"
                                            onBlur={disableInput}
                                            onKeyDown={onKeyDown}
                                        />
                                    ) : (
                                        tag.name
                                    )}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="ml-auto hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                            >
                                                <MoreHorizontal />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="start"
                                            onClick={(event) => event.stopPropagation()}
                                            onCloseAutoFocus={(event) => {
                                                event.preventDefault();
                                                if (operation === "rename") enableInput(tag);
                                            }}
                                        >
                                            <DropdownMenuItem
                                                onSelect={(event) => {
                                                    event.stopPropagation();
                                                    setOperation("rename");
                                                }}
                                            >
                                                <TextCursorInput
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                Rename tag
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={(event) => {
                                                    event.stopPropagation();
                                                    setOperation("delete");
                                                    handleDeleteTag(tag.id);
                                                }}
                                            >
                                                <Trash2
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                Delete tag
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
};

TagModel.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.object),
};
