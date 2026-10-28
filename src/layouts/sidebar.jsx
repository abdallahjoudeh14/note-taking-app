import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useModel } from "@/hooks/use-model";

import { toast } from "sonner";

import { ResizablePanel } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarItem } from "@/components/sidebar-item";
import { SettingsModel } from "@/components/settings-model";
import { SearchModel } from "@/components/search-model";
import { TagModel } from "@/components/tag-model";
import { Logo } from "@/components/logo";

import { ChevronsLeft, CirclePlus, File, Notebook, Search, Settings, Tag as TagIcon, Tags as TagsIcon } from "lucide-react";
import { FavNotebook } from "@/assets/icons/fav-notebook";

import { cn } from "@/lib/utils";

import Notestore from "@/services/api/note-store";

export const Sidebar = () => {
    const navigate = useNavigate();
    const params = useParams();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isExpanded, setIsExpanded] = useState({});
    const [tagName, setTagName] = useState("");

    const panelRef = useRef(null);

    const tagPopover = useModel();
    const settingsModel = useModel();
    const searchModel = useModel();
    const tagModel = useModel();

    const notebooks = useLiveQuery(() => Notestore.getNotebooks(), []);
    const notes = useLiveQuery(() => Notestore.getNotes(), []);
    const tags = useLiveQuery(() => Notestore.getTags(), []);

    const handleCreateNotebook = () => {
        const promise = Notestore.createNotebook({ name: "Notebook" });
        toast.promise(promise, {
            loading: "Creating a new notebook...",
            success: "New notebook created!",
            error: "Failed to create a notebook.",
        });
    };

    const handleCreateNote = async () => {
        const defaultNotebook = await Notestore.getDefaultNotebook();

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
            if (result) Notestore.updateNotebook(params.notebookId || defaultNotebook.id, { updated_at: Date.now() });
        });
    };

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

    const onExpand = (ele) => {
        setIsExpanded((prev) => ({ ...prev, [ele]: !prev[ele] }));
    };

    return (
        <>
            <ResizablePanel
                ref={panelRef}
                id="sidebar-panel"
                order={1}
                minSize={15}
                maxSize={20}
                collapsedSize={4}
                collapsible={true}
                onCollapse={() => setIsCollapsed(true)}
                onResize={() => setIsCollapsed(false)}
                className={cn(isCollapsed && "w-[62px] !flex-none transition-all duration-300 ease-in-out")}
            >
                <aside className={cn(isCollapsed && "items-center", "flex h-full flex-col overflow-hidden")}>
                    <div className="p-3">
                        <div className={`flex items-center justify-between ${!isCollapsed && "px-4"}`}>
                            <div className="flex items-center gap-x-2">
                                <Logo />

                                {!isCollapsed && <p className="text-base font-medium">Noting</p>}
                            </div>
                            {!isCollapsed && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if (!isCollapsed) panelRef?.current?.collapse();
                                    }}
                                    className="size-7"
                                >
                                    <ChevronsLeft size={24} />
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex w-full flex-col gap-y-2 p-3">
                        <SidebarItem
                            label="Search"
                            icon={Search}
                            isSidebarCollapsed={isCollapsed}
                            onClick={() => searchModel.onOpen()}
                        />
                        <SidebarItem
                            label="Settigns"
                            icon={Settings}
                            isSidebarCollapsed={isCollapsed}
                            onClick={() => settingsModel.onOpen()}
                        />
                        <SidebarItem
                            label="New note"
                            icon={CirclePlus}
                            isSidebarCollapsed={isCollapsed}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleCreateNote();
                            }}
                        />
                    </div>
                    <Separator />
                    <div className="flex h-full w-full flex-col gap-y-2 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
                        <SidebarItem
                            label="Notes"
                            icon={File}
                            createTooltipText="new note"
                            className="group"
                            isSidebarCollapsed={isCollapsed}
                            onClick={() => navigate("/notes")}
                            isCreationMode
                            onCreate={(event) => {
                                event.stopPropagation();
                                handleCreateNote();
                            }}
                        />
                        <div className="flex flex-col">
                            <SidebarItem
                                label="Notebooks"
                                createTooltipText="new notebook"
                                icon={Notebook}
                                className="group"
                                isSidebarCollapsed={isCollapsed}
                                canExpand
                                onClick={() => navigate("/notebooks")}
                                onExpand={() => onExpand("Notebooks")}
                                isExpanded={isExpanded["Notebooks"]}
                                isCreationMode
                                onCreate={(event) => {
                                    event.stopPropagation();
                                    handleCreateNotebook();
                                }}
                            />

                            {/* ===== Notebook list ===== */}

                            {!isCollapsed && isExpanded["Notebooks"] && (
                                <div className="flex flex-col pt-2">
                                    {notebooks?.map((notebook) => (
                                        <SidebarItem
                                            key={notebook.id}
                                            size="sm"
                                            label={notebook.name}
                                            icon={notebook.default_notebook == "true" ? FavNotebook : Notebook}
                                            isSubItem
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                navigate(`notebook/${notebook.id}`);
                                            }}
                                            className={cn(notebook.id === params.notebookId && "bg-secondary")}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <SidebarItem
                                label="Tags"
                                createTooltipText="new tag"
                                icon={TagsIcon}
                                className="group"
                                isSidebarCollapsed={isCollapsed}
                                canExpand
                                onClick={() => tagModel.onOpen()}
                                onExpand={() => onExpand("Tags")}
                                isExpanded={isExpanded["Tags"]}
                                isCreationMode
                                onCreate={(event) => {
                                    event.stopPropagation();
                                    tagPopover.onOpen();
                                }}
                            />

                            <Popover
                                open={tagPopover.isOpen}
                                onOpenChange={tagPopover.onClose}
                            >
                                <PopoverTrigger />
                                <PopoverContent
                                    side="right"
                                    sideOffset={15}
                                    align="start"
                                    alignOffset={-50}
                                >
                                    <form
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();

                                            handleCreateTag(tagName);
                                            setTagName("");
                                            tagPopover.onClose();
                                        }}
                                    >
                                        <div className="grid gap-y-3">
                                            <Label
                                                htmlFor="tag-name"
                                                className="text-sm font-medium"
                                            >
                                                Tag name:
                                            </Label>
                                            <Input
                                                type="text"
                                                id="tag-name"
                                                placeholder="Tag name"
                                                value={tagName}
                                                onInput={(event) => setTagName(event.target.value)}
                                                required
                                            />
                                            <Button
                                                type="submit"
                                                className="w-fit justify-self-end"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </form>
                                </PopoverContent>
                            </Popover>

                            {/* ===== Tag list ===== */}
                            {!isCollapsed && isExpanded["Tags"] && (
                                <div className="flex flex-col pt-2">
                                    {tags.length ? (
                                        tags.map((tag) => (
                                            <SidebarItem
                                                key={tag.id}
                                                size="sm"
                                                label={tag.name}
                                                icon={TagIcon}
                                                isSubItem
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    navigate(`tag/${tag.id}`);
                                                }}
                                                className={cn(tag.id === params.tagId && "bg-secondary")}
                                            />
                                        ))
                                    ) : (
                                        <p className="pl-7 text-sm font-medium text-muted-foreground">No tags inside</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ===== Copyright ===== */}
                        {!isCollapsed && (
                            <div className="mt-auto p-3">
                                <p className="text-sm font-medium text-muted-foreground">© 2024 XD Code All Rights Reserved</p>
                            </div>
                        )}
                    </div>
                </aside>
            </ResizablePanel>

            <SettingsModel
                isOpen={settingsModel.isOpen}
                onClose={settingsModel.onClose}
            />
            <SearchModel
                isOpen={searchModel.isOpen}
                onClose={searchModel.onClose}
                data={{ notebooks, notes, tags }}
            />
            <TagModel
                isOpen={tagModel.isOpen}
                onClose={tagModel.onClose}
                tags={tags}
            />
        </>
    );
};
