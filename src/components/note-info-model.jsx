import { useLiveQuery } from "dexie-react-hooks";

import moment from "moment";

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import Notestore from "@/services/api/note-store";

import Proptype from "prop-types";

export const NoteInfoModel = ({ isOpen, onClose, note }) => {
    const notebook = useLiveQuery(() => note && Notestore.getNotebook(note?.notebook_id), [note?.notebook_id]);
    const tags = useLiveQuery(() => note && Notestore.getTagsByNote(note?.id), [note?.id]);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={onClose}
        >
            <DialogContent onOpenAutoFocus={(event) => event.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Note Info</DialogTitle>
                </DialogHeader>
                <div className="grid w-full gap-y-4 pr-4">
                    <div className="grid grid-cols-[25%_75%] items-center gap-x-4">
                        <Label className="text-right">Title</Label>
                        <Input
                            value={note?.title}
                            readOnly
                            className="focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                    <div className="grid grid-cols-[25%_75%] items-center gap-x-4">
                        <Label className="text-right">Located in</Label>
                        <Input
                            value={notebook?.name}
                            readOnly
                            className="focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                    <div className="grid grid-cols-[25%_75%] items-center gap-x-4">
                        <Label className="text-right">Tags</Label>
                        <div className="flex gap-x-1 overflow-auto [scrollbar-width:_thin]">
                            {tags?.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="flex-shrink-0 overflow-hidden whitespace-nowrap rounded"
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-[25%_75%] items-center gap-x-4">
                        <Label className="text-right">Created at</Label>
                        <Input
                            value={moment(note?.created_at).format("dddd, MMMM D, YYYY, [at] h:mm A")}
                            readOnly
                            className="focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                    <div className="grid grid-cols-[25%_75%] items-center gap-x-4">
                        <Label className="text-right">Updated at</Label>
                        <Input
                            value={moment(note?.updated_at).format("dddd, MMMM D, YYYY, [at] h:mm A")}
                            readOnly
                            className="focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

NoteInfoModel.propTypes = {
    isOpen: Proptype.bool,
    onClose: Proptype.func,
    note: Proptype.object,
};
