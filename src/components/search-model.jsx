import { useNavigate } from "react-router-dom";

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";

import { File, Notebook, Tag } from "lucide-react";
import { FavNotebook } from "@/assets/icons/fav-notebook";

import PropTypes from "prop-types";

export const SearchModel = ({ isOpen, onClose, data }) => {
    const navigate = useNavigate();

    const runCommand = (command) => {
        if (typeof command === "function") command();
        onClose();
    };

    return (
        <CommandDialog
            open={isOpen}
            onOpenChange={onClose}
        >
            <CommandInput placeholder="Search for notebooks, notes and tags..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Notebooks">
                    {data.notebooks?.map((notebook) => (
                        <CommandItem
                            key={notebook.id}
                            value={`${notebook.id}-${notebook.name}`}
                            onSelect={() => {
                                runCommand(() => navigate(`notebook/${notebook.id}`));
                            }}
                        >
                            {notebook.default_notebook === "true" ? (
                                <FavNotebook
                                    size={20}
                                    className="mr-2"
                                />
                            ) : (
                                <Notebook
                                    size={20}
                                    className="mr-2"
                                />
                            )}
                            {notebook.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                {data.notes?.length > 0 && (
                    <CommandGroup heading="Notes">
                        {data.notes?.map((note) => (
                            <CommandItem
                                key={note.id}
                                value={`${note.id}-${note.title}`}
                                onSelect={() => {
                                    runCommand(() => navigate(`notebook/${note.notebook_id}/note/${note.id}`));
                                }}
                            >
                                <File
                                    size={20}
                                    className="mr-2"
                                />
                                {note.title}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
                <CommandSeparator />
                {data.tags?.length > 0 && (
                    <CommandGroup heading="Tags">
                        {data.tags?.map((tag) => (
                            <CommandItem
                                key={tag.id}
                                value={`${tag.id}-${tag.name}`}
                                onSelect={() => {
                                    runCommand(() => navigate(`tag/${tag.id}`));
                                }}
                            >
                                <Tag
                                    size={20}
                                    className="mr-2"
                                />
                                {tag.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
};

SearchModel.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    data: PropTypes.objectOf(PropTypes.array),
};
