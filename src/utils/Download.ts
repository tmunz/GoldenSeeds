/** Start a browser download and release its temporary object URL afterwards. */
export function downloadFile(name: string, data: Blob): void {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.download = name;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
