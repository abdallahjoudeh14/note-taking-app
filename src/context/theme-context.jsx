import { createContext, useEffect, useState } from "react";

import PropTypes from "prop-types";

const initialState = {
    theme: "system",
    setTheme: () => null,
};

export const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme", ...props }) {
    const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) || defaultTheme);

    useEffect(() => {
        const root = window.document.documentElement;
        const DARK_MODE_QUERY = window.matchMedia("(prefers-color-scheme: dark)");

        const applyTheme = (theme) => {
            root.classList.remove("light", "dark");

            if (theme === "system") {
                const sysTheme = DARK_MODE_QUERY.matches ? "dark" : "light";
                root.classList.add(sysTheme);
            } else {
                root.classList.add(theme);
            }
        };

        applyTheme(theme);

        const handleDarkModeChange = () => applyTheme("system");

        DARK_MODE_QUERY.addEventListener("change", handleDarkModeChange);

        return () => DARK_MODE_QUERY.removeEventListener("change", handleDarkModeChange);
    }, [theme]);

    const value = {
        theme,
        setTheme: (newTheme) => {
            localStorage.setItem(storageKey, newTheme);
            setTheme(newTheme);
        },
    };

    return (
        <ThemeProviderContext.Provider
            value={value}
            {...props}
        >
            {children}
        </ThemeProviderContext.Provider>
    );
}

ThemeProvider.propTypes = {
    children: PropTypes.node,
    defaultTheme: PropTypes.oneOf(["system", "dark", "light"]),
    storageKey: PropTypes.string,
};

ThemeProvider.displayName = "ThemeProvider";
