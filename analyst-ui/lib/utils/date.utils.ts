/* Convert data like 2024-12-29T20:58:56.705219 to 2024-12-29 20:58 */
export const formatDateForDisplay = (date: string) => {
  return date.replace("T", " ").slice(0, 16);
};
