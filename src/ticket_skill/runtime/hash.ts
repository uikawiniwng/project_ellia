export function hashText(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function hashTicketKey(title: string, story: string): string {
  return `et_${hashText(`${title.trim()}␟${story.trim()}`)}`;
}
