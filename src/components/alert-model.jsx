import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import PropTypes from "prop-types";

export const AlertModel = ({ titleText, descriptionText, cancelText, actionText, isOpen, onClose, onAction }) => {
    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={onClose}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{titleText}</AlertDialogTitle>
                    <AlertDialogDescription>{descriptionText}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onAction}
                        variant="destructive"
                    >
                        {actionText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

AlertModel.propTypes = {
    titleText: PropTypes.string,
    descriptionText: PropTypes.string,
    cancelText: PropTypes.string,
    actionText: PropTypes.string,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onAction: PropTypes.func,
};
