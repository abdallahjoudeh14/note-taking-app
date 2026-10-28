import { Command, CommandEmpty, CommandInput, CommandItem, CommandList, CommandGroup } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FavNotebook } from "@/assets/icons/fav-notebook";
import { Notebook } from "lucide-react";

import PropTypes from "prop-types";

export const MoveCopyModel = ({ title, isOpen, onClose, notebooks = [], activeNotebookId, command = () => {} }) => {
    const runCommand = (notebookId) => {
        command(notebookId);
        onClose();
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={onClose}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <p className="pb-4 text-xl">{title}</p>
                    </DialogTitle>
                </DialogHeader>
                <Command
                    loop
                    className={[
                        "overflow-visible rounded-none",
                        "[&_[cmdk-input-wrapper]:has(:focus-visible)]:has-[:focus-visible]:ring-2 [&_[cmdk-input-wrapper]:has(:focus-visible)]:has-[:focus-visible]:ring-zinc-950 [&_[cmdk-input-wrapper]:has(:focus-visible)]:has-[:focus-visible]:ring-offset-2 dark:[&_[cmdk-input-wrapper]:has(:focus-visible)]:has-[:focus-visible]:ring-zinc-300 [&_[cmdk-input-wrapper]]:h-11 [&_[cmdk-input-wrapper]]:w-full [&_[cmdk-input-wrapper]]:rounded-md [&_[cmdk-input-wrapper]]:border [&_[cmdk-input-wrapper]]:border-zinc-200 [&_[cmdk-input-wrapper]]:ring-offset-white dark:[&_[cmdk-input-wrapper]]:border-zinc-800 dark:[&_[cmdk-input-wrapper]]:ring-offset-zinc-950",
                        "[&_[cmdk-list]]:mt-4",
                        "[&_[cmdk-item]]:h-11",
                    ]}
                >
                    <CommandInput placeholder="Search for notebooks..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>

                        <CommandGroup>
                            {notebooks?.map((notebook) => (
                                <CommandItem
                                    key={notebook.id}
                                    value={`${notebook.id}-${notebook.name}`}
                                    onSelect={() => activeNotebookId !== notebook.id && runCommand(notebook.id)}
                                    disabled={activeNotebookId === notebook.id}
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
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
};

MoveCopyModel.propTypes = {
    title: PropTypes.string,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    notebooks: PropTypes.arrayOf(PropTypes.object),
    activeNotebookId: PropTypes.string,
    command: PropTypes.func,
};
