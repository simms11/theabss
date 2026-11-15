import { describe, expect, it } from 'vitest'

import { fileTypeLabel, formatFileSize } from '../../src/lib/files'

describe('download labels', () => {
  it('gives sizes in the units people recognise', () => {
    expect(formatFileSize(200)).toBe('1 KB')
    expect(formatFileSize(194 * 1024)).toBe('194 KB')
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2 MB')
    expect(formatFileSize(0)).toBe('')
    expect(formatFileSize(null)).toBe('')
  })

  it('names the file type from its type or its name', () => {
    expect(fileTypeLabel('application/pdf')).toBe('PDF')
    expect(fileTypeLabel(null, 'Form.PDF')).toBe('PDF')
    expect(
      fileTypeLabel('application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    ).toBe('Word')
    expect(fileTypeLabel(null, 'form.doc')).toBe('Word')
    expect(fileTypeLabel(null, 'unknown')).toBe('File')
  })
})
