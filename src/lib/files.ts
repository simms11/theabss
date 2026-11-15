/** "194 KB", "1.5 MB". Shown beside a download so a parent on mobile data knows its size. */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes || bytes < 0) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`
}

/** "PDF" or "Word", from the file's type or, failing that, its name. */
export const fileTypeLabel = (
  mimeType: string | null | undefined,
  filename?: string | null,
): string => {
  if (mimeType === 'application/pdf' || filename?.toLowerCase().endsWith('.pdf')) return 'PDF'
  if (mimeType?.includes('word') || /\.docx?$/i.test(filename ?? '')) return 'Word'
  return 'File'
}
