import { forwardRef, useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import { ChevronRight, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import PropTypes from "prop-types";

export const SidebarItem = forwardRef((props, ref) => {
    const {
        className,
        label,
        createTooltipText,
        icon: Icon,
        size = "default",
        isSidebarCollapsed,
        canExpand,
        isExpanded,
        isSubItem,
        isCreationMode,
        onClick,
        onExpand,
        onCreate,
        ...rest
    } = props;

    const [isHover, setIsHover] = useState(false);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    ref={ref}
                    variant="ghost"
                    size={isSidebarCollapsed ? "icon" : size}
                    className={cn("w-full", !isSidebarCollapsed && "justify-start gap-x-2", isSubItem && "pl-7", className)}
                    onClick={onClick}
                    onMouseEnter={() => setIsHover(true)}
                    onMouseLeave={() => setIsHover(false)}
                    {...rest}
                >
                    {canExpand && isHover && !isSidebarCollapsed ? (
                        <span
                            className={"block rounded p-0.5 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"}
                            onClick={(event) => {
                                event.stopPropagation();
                                if (typeof onExpand === "function") onExpand();
                            }}
                        >
                            <ChevronRight
                                size={size === "sm" ? 16 : 20}
                                className={cn("transition-transform", isExpanded && "rotate-90")}
                            />
                        </span>
                    ) : (
                        <Icon
                            size={size === "sm" ? 16 : 20}
                            className={"box-content flex-shrink-0 p-0.5"}
                        />
                    )}

                    {!isSidebarCollapsed && <span className="overflow-hidden text-ellipsis">{label}</span>}
                    {!isSidebarCollapsed && isCreationMode && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    className="pointer-events-none ml-auto opacity-0 transition-opacity focus-visible:pointer-events-auto focus-visible:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
                                    onClick={onCreate}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            onCreate(event);
                                        }
                                    }}
                                    tabIndex={0}
                                >
                                    <PlusCircle size={size === "sm" ? 16 : 20} />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                sideOffset={5}
                                className="font-normal"
                            >
                                {createTooltipText}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent
                side="right"
                sideOffset={10}
            >
                {label}
            </TooltipContent>
        </Tooltip>
    );
});

SidebarItem.displayName = "SidebarItem";

SidebarItem.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    label: PropTypes.string,
    createTooltipText: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    size: PropTypes.string,
    isSidebarCollapsed: PropTypes.bool,
    canExpand: PropTypes.bool,
    isExpanded: PropTypes.bool,
    isSubItem: PropTypes.bool,
    isCreationMode: PropTypes.bool,
    onClick: PropTypes.func,
    onExpand: PropTypes.func,
    onCreate: PropTypes.func,
};
