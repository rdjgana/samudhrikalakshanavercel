import * as XLSX from 'xlsx'

const escapeCSV = (value) => {
  const str = value == null ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`
  return str
}

export const buildHeadersFromRows = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return []
  const keys = new Set()
  rows.forEach((r) => {
    if (r && typeof r === 'object') Object.keys(r).forEach((k) => keys.add(k))
  })
  return Array.from(keys)
}

export const toCSV = (rows, headers) => {
  const safeHeaders = headers?.length ? headers : buildHeadersFromRows(rows)
  const headerLine = safeHeaders.map(escapeCSV).join(',')
  const lines = (rows || []).map((row) => safeHeaders.map((h) => escapeCSV(row?.[h])).join(','))
  return [headerLine, ...lines].join('\n')
}

export const downloadBlob = (blob, filename) => {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadCSV = (rows, filename, headers) => {
  const csv = toCSV(rows, headers)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

export const downloadXLSX = (rows, filename, sheetName = 'Report') => {
  const worksheet = XLSX.utils.json_to_sheet(rows || [])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)
}

