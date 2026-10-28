import PropTypes from "prop-types";

export const FavNotebook = ({ size = 24, stroke = "currentColor", strokeWidth = 2, strokeLinecap = "round", strokeLinejoin = "round", ...rest }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap={strokeLinecap}
            strokeLinejoin={strokeLinejoin}
            {...rest}
        >
            <path d="M2 6H6" />
            <path d="M2 10H6" />
            <path d="M2 14H6" />
            <path d="M2 18H6" />
            <path d="M16 2V14Z" />
            <path d="M16 2V14" />
            <path d="M20 12V4C20 2.89543 19.1046 2 18 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H13" />
            <path
                d="M19.411 16L20.465 18.0867L22.8221 18.4233L21.1166 20.0467L21.5191 22.34L19.411 21.2567L17.303 22.34L17.7055 20.0467L16 18.4233L18.357 18.0867L19.411 16Z"
                fill={stroke}
            />
        </svg>
    );
};

FavNotebook.propTypes = {
    size: PropTypes.number,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
    strokeLinecap: PropTypes.oneOf(["butt", "inherit", "round", "square"]),
    strokeLinejoin: PropTypes.oneOf(["bevel", "inherit", "round", "miter"]),
};

FavNotebook.displayName = "FavNotebook";
