export const safeJsonParse = (response: string) => {
  try {
    return JSON.parse(response);
  } catch (e) {
    return console.error(e);
  }
};
