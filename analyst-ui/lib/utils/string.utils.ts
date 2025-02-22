export const formatText = (text: string) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
};

export const removeSpaces = (text: string) => {
  return text.replaceAll(" ", "");
};

export const nameToSlug = (name: string) => {
  return name.toLowerCase().replaceAll(" ", "-");
};

export const toCssVarName = (text: string) => {
  return text.replace(/[^a-zA-Z0-9]/g, "_");
};
