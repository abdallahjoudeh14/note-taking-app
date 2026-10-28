import { useEffect, useRef, useState } from "react";
import { useModel } from "@/hooks/use-model";
import { useClickOutside } from "@/hooks/use-click-outside";

import {
    Command,
    CommandGroup,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

import { X } from "lucide-react";

import PropTypes from "prop-types";

export const OptionSelect = ({ options, selectedOptions, maxOptionsDisplay = 4, text, placeholder, onCreateOption, onChange }) => {
    const [opts, setOpts] = useState(options || []);
    const [selectedOpts, setSelectedOpts] = useState(selectedOptions || []);
    const [inputValue, setInputValue] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const inputRef = useRef(null);
    const popoverRef = useRef(null);
    const popover = useModel();

    useEffect(() => {
        setOpts(options);
        setSelectedOpts(selectedOptions);
    }, [options, selectedOptions]);

    useEffect(() => {
        isEditing ? popover.onOpen() : popover.onClose();
    }, [isEditing, popover]);

    useClickOutside([inputRef, popoverRef], () => setIsEditing(false));

    const enableInput = () => {
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current.focus();
        }, 0);
    };

    const selectOption = (option) => {
        if (!selectedOpts.some((selected) => selected.value === option.value)) {
            const newSelectedOpts = [...selectedOpts, option];
            onChange ? onChange(newSelectedOpts) : setSelectedOpts(newSelectedOpts);
        }
        setInputValue("");
    };

    const createOption = ({ value, label }) => {
        const newOption = { value, label };
        if (!opts.some((option) => option.value === newOption.value)) {
            if (onCreateOption) {
                onCreateOption(label);
            } else {
                setOpts([...opts, newOption]);
                selectOption(newOption);
            }
        }
        setInputValue("");
    };

    const removeOption = (option) => {
        const newSelectedOpts = selectedOpts.filter((item) => item.value !== option.value);
        onChange ? onChange(newSelectedOpts) : setSelectedOpts(newSelectedOpts);
    };

    const onKeyPress = (event) => {
        if (event.key === "Tab") {
            event.preventDefault();
            if (inputValue.trim() && !opts.some((option) => option.label === inputValue.trim())) {
                createOption({ value: inputValue.trim(), label: inputValue.trim() });
                setInputValue("");
            }
        }
    };

    return (
        <div className="flex w-fit gap-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
                {selectedOpts?.slice(0, maxOptionsDisplay).map((option) => (
                    <Badge
                        key={option.value}
                        variant="secondary"
                        className="flex h-6 cursor-pointer items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded border-0 p-0"
                    >
                        <span className="px-1">{option.label}</span>
                        <span
                            className="flex h-full items-center justify-center px-1 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeOption(option)}
                        >
                            <X size={14} />
                        </span>
                    </Badge>
                ))}
                {selectedOpts?.length > maxOptionsDisplay && <span>+{selectedOpts.length - maxOptionsDisplay}</span>}
            </div>

            <Command
                filter={(value, search) => {
                    if (value.trim().includes(search.trim())) return 1;
                    return 0;
                }}
                className={[
                    "overflow-visible rounded-none",
                    "[&_[cmdk-input-wrapper]]:h-6 [&_[cmdk-input-wrapper]]:w-44 [&_[cmdk-input-wrapper]]:rounded-md [&_[cmdk-input-wrapper]]:border [&_[cmdk-input-wrapper]]:border-zinc-200 [&_[cmdk-input-wrapper]]:px-1 dark:[&_[cmdk-input-wrapper]]:border-zinc-800",
                    "[&_[cmdk-input-icon]]:hidden",
                ]}
            >
                {isEditing ? (
                    <CommandInput
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onKeyDown={onKeyPress}
                        placeholder={placeholder}
                    />
                ) : (
                    <p
                        tabIndex={0}
                        onClick={enableInput}
                        onFocus={enableInput}
                        className="h-6 text-muted-foreground"
                    >
                        {text}
                    </p>
                )}
                <Popover
                    open={popover.isOpen}
                    onOpenChange={popover.onClose}
                >
                    <PopoverTrigger />
                    <PopoverContent
                        ref={popoverRef}
                        align="start"
                        className="max-h-60 w-44 overflow-y-auto overflow-x-hidden p-2 [scrollbar-width:_thin]"
                        onOpenAutoFocus={(event) => event.preventDefault()}
                        onEscapeKeyDown={() => setIsEditing(false)}
                    >
                        <CommandList className="flex flex-col gap-y-1">
                            <CommandEmpty className="text-center">no options</CommandEmpty>
                            <CommandGroup className="p-0">
                                {opts
                                    ?.filter((option) => !selectedOpts?.some((selected) => selected.value === option.value))
                                    ?.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.label}
                                            onSelect={() => selectOption(option)}
                                        >
                                            {option.label}
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                            {inputValue.trim() && !opts.some((option) => option.label.trim() === inputValue.trim()) && (
                                <>
                                    <CommandSeparator
                                        alwaysRender={true}
                                        className="my-2"
                                    />
                                    <CommandGroup>
                                        <CommandItem
                                            value={`Create "${inputValue}"`}
                                            onSelect={() => createOption({ value: inputValue.trim(), label: inputValue.trim() })}
                                        >
                                            Create &quot;{inputValue}&quot;
                                            <CommandShortcut>tab</CommandShortcut>
                                        </CommandItem>
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </PopoverContent>
                </Popover>
            </Command>
        </div>
    );
};

OptionSelect.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any.isRequired,
            label: PropTypes.string.isRequired,
        }),
    ),
    selectedOptions: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any.isRequired,
            label: PropTypes.string.isRequired,
        }),
    ),
    maxOptionsDisplay: PropTypes.number,
    text: PropTypes.string,
    placeholder: PropTypes.string,
    onCreateOption: PropTypes.func,
    onChange: PropTypes.func,
};
