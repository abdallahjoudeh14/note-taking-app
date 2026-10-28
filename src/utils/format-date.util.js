import moment from "moment";

/**
 * Formats a date based on the given timestamp.
 *
 * If the date is more than one day ago, it formats the date as "MMM D" (e.g., "Aug 24").
 * Otherwise, it returns a relative time string (e.g., "a few seconds ago", "an hour ago").
 *
 * @param {number} dateMS - The date in milliseconds.
 * @returns {string} - The formatted date string.
 */

export const formatDate = (dateMS) => {
    const date = moment(dateMS);
    const oneDayAgo = moment().subtract(1, "days");

    if (date.isBefore(oneDayAgo)) {
        return date.format("MMM D");
    } else {
        return date.fromNow();
    }
};
