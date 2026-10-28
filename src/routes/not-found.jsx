import { Button } from "@/components/ui/button";
import { Link, useRouteError } from "react-router-dom";

const NotFoundPage = () => {
    const error = useRouteError();

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md text-center">
                <h1 className="mt-4 text-6xl font-bold">{error?.status || "404"}</h1>
                <p className="text-muted-foreground mt-4">{error?.statusText || "Oops, page not found."}</p>
                <div className="mt-6">
                    <Button asChild>
                        <Link to={"/"}>Go to Homepage</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
