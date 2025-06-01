
/**
 * Calculates the date 12 days before the given release date.
 * @param releaseDateStr The release date in YYYY-MM-DD format.
 * @returns The calculated date in "YYYY年M月D日" format, or null if input is invalid.
 */
export const calculateFirstDraftReturnDate = (releaseDateStr: string): string | null => {
  try {
    // Ensure the date string is valid and includes timezone context if needed,
    // though YYYY-MM-DD usually implies local timezone or UTC depending on JS engine.
    // For simplicity, we assume it's treated consistently.
    const releaseDate = new Date(releaseDateStr + 'T00:00:00'); // Add time part to avoid timezone issues with just date
    if (isNaN(releaseDate.getTime())) {
      console.error("Invalid release date string:", releaseDateStr);
      return null;
    }

    const firstDraftDate = new Date(releaseDate);
    firstDraftDate.setDate(releaseDate.getDate() - 12);

    const year = firstDraftDate.getFullYear();
    const month = firstDraftDate.getMonth() + 1; // JavaScript months are 0-indexed
    const day = firstDraftDate.getDate();

    return `${year}年${month}月${day}日`;
  } catch (error) {
    console.error("Error calculating first draft return date:", error);
    return null;
  }
};
