import { useState, type DragEvent } from 'react'

interface FileDropzoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

export function FileDropzone({ onFile, disabled }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file && !disabled) onFile(file)
  }

  return (
    <label
      htmlFor="arquivo-relatorio"
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-emerald-700 ${
        dragging ? 'border-emerald-700 bg-emerald-50' : 'border-slate-300 bg-white hover:bg-slate-50'
      }`}
    >
      <span className="text-lg font-semibold">Arraste o relatório aqui ou clique para escolher</span>
      <span className="text-sm text-slate-600">Arquivos .xlsx ou .csv exportados da Central do Vendedor</span>
      <input
        id="arquivo-relatorio"
        type="file"
        accept=".xlsx,.xls,.csv"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          event.target.value = ''
        }}
      />
    </label>
  )
}
