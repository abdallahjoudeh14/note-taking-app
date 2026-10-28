import logoDark from "@/assets/logo-dark.svg";
import logoLight from "@/assets/logo-light.svg";

import PropTypes from "prop-types";

export const Logo = ({ size = 24 }) => {
    return (
        <>
            <img
                src={logoDark}
                alt="Logo"
                className="hidden flex-shrink-0 p-0.5 dark:block"
                width={size}
                height={size}
            />

            <img
                src={logoLight}
                alt="Logo"
                className="flex-shrink-0 p-0.5 dark:hidden"
                width={size}
                height={size}
            />
        </>
    );
};

Logo.propTypes = {
    size: PropTypes.number,
};
