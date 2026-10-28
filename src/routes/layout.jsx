import { Outlet } from "react-router-dom";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useTheme } from "@/hooks/use-theme";

import { Toaster } from "sonner";

import { ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sidebar } from "@/layouts/sidebar";

import { TriangleAlert } from "lucide-react";

const Layout = () => {
    const { theme } = useTheme();
    const isMobileDevice = useMediaQuery("only screen and (max-width : 768px)");

    return (
        <>
            {!isMobileDevice ? (
                <div className="h-screen">
                    <ResizablePanelGroup
                        direction="horizontal"
                        autoSaveId="parent-layout"
                    >
                        <Sidebar />
                        <ResizableHandle />
                        <Outlet />
                    </ResizablePanelGroup>
                </div>
            ) : (
                <div className="flex min-h-[100dvh] items-center justify-center px-4 py-12">
                    <div className="mx-auto max-w-md text-center">
                        <TriangleAlert
                            className="mx-auto"
                            size={48}
                        />
                        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Oops! Not supported for mobile devices</h1>
                        <p className="mt-4">
                            This website is currently optimized for desktop viewing. Please use a larger screen to access the full experience.
                        </p>
                    </div>
                </div>
            )}
            <Toaster
                theme={theme}
                richColors
            />
        </>
    );
};

export default Layout;
