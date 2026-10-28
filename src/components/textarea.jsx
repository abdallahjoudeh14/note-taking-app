import { forwardRef, useState } from "react";

import TextareaAutosize from "react-textarea-autosize";

import { cn } from "@/lib/utils";

import PropTypes from "prop-types";

export const Textarea = forwardRef((props, ref) => {
    const { id, className, initialValue, onValueChange = () => {}, onKeyDown = () => {}, placeholder, maxlength, ...rest } = props;

    const [title, setTitle] = useState(initialValue !== placeholder ? initialValue : "");

    const handleChange = (event) => {
        const currentText = event.target.value;
        setTitle(currentText);
        onValueChange(currentText);
    };

    const handleKeyDown = (event) => {
        const currentText = event.target.value;
        if (maxlength && currentText.length >= maxlength && event.key.length === 1 && event.ctrlKey === false && event.metaKey === false) {
            event.preventDefault();
        }
        onKeyDown(event);
    };

    const handlePaste = async (event) => {
        const currentText = event.target.value;
        const pasteText = await event.clipboardData.getData("text");

        if (maxlength && currentText.length + pasteText.length >= maxlength) {
            event.preventDefault();
            const truncatedText = pasteText.substring(0, maxlength - currentText.length);
            setTitle(currentText + truncatedText);
            onValueChange(currentText + truncatedText);
        }
    };

    return (
        <TextareaAutosize
            ref={ref}
            id={id}
            className={cn(
                "w-full flex-shrink-0 resize-none overflow-hidden whitespace-pre-wrap bg-transparent text-base font-medium outline-none",
                className,
            )}
            spellCheck="true"
            value={title}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            {...rest}
        />
    );
});

Textarea.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    initialValue: PropTypes.string,
    onValueChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    placeholder: PropTypes.string,
    maxlength: PropTypes.number,
};

Textarea.displayName = "Textarea";
