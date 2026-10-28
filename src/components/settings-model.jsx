import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";

import PropTypes from "prop-types";

export const SettingsModel = ({ isOpen, onClose }) => {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={onClose}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <p className="pb-4 text-xl">My Settings</p>
                    </DialogTitle>
                    <Separator />
                </DialogHeader>
                <div className="flex items-center justify-between">
                    <p className="text-base font-medium">Apperance</p>
                    <ModeToggle />
                </div>
            </DialogContent>
        </Dialog>
    );
};

SettingsModel.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
};
