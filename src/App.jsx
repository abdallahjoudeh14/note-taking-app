import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import { useLiveQuery } from "dexie-react-hooks";

import { ThemeProvider } from "@/context/theme-context";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "@/routes/layout";
import NotebookPage from "@/routes/notebook/page";
import NotePage from "@/routes/notebook/note/page";
import NotesPage from "@/routes/notes/page";
import NotebooksPage from "@/routes/notebooks/page";
import TagPage from "@/routes/tag/page";
import NoteTagPage from "@/routes/tag/note/page";
import NotFoundPage from "@/routes/not-found";

import { Loader } from "lucide-react";

import Notestore from "@/services/api/note-store";

function App() {
    const defaultNotebook = useLiveQuery(() => Notestore.getDefaultNotebook(), []);

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            errorElement: <NotFoundPage />,
            children: [
                {
                    index: true,
                    element: (
                        <Navigate
                            to={`notebook/${defaultNotebook?.id}`}
                            replace={true}
                        />
                    ),
                },
                {
                    path: "notebooks",
                    element: <NotebooksPage />,
                },
                {
                    path: "notes",
                    element: <NotesPage />,
                },
                {
                    path: "notes/:noteId",
                    element: <NotesPage />,
                },
                {
                    path: "notebook",
                    element: (
                        <Navigate
                            to={`${defaultNotebook?.id}`}
                            replace={true}
                        />
                    ),
                },
                {
                    path: "notebook/:notebookId",
                    element: <NotebookPage />,
                    children: [
                        {
                            path: "note",
                            element: <NotePage />,
                        },
                        {
                            path: "note/:noteId",
                            element: <NotePage />,
                        },
                    ],
                },
                {
                    path: "tag/:tagId",
                    element: <TagPage />,
                    children: [
                        {
                            path: "note",
                            element: <NoteTagPage key={location.pathname} />,
                        },
                        {
                            path: "note/:noteId",
                            element: <NoteTagPage key={location.pathname} />,
                        },
                    ],
                },
            ],
        },
        {
            path: "*",
            element: <NotFoundPage />,
        },
    ]);

    if (!defaultNotebook) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader
                    size={28}
                    className="animate-spin text-muted-foreground"
                />
            </div>
        );
    }

    return (
        <ThemeProvider
            defaultTheme="system"
            storageKey="theme"
        >
            <TooltipProvider>
                <RouterProvider router={router} />
            </TooltipProvider>
        </ThemeProvider>
    );
}

export default App;
