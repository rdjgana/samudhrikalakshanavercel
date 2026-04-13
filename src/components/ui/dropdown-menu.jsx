import { useState, useRef, useEffect } from 'react'

export const DropdownMenu = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const alignmentClasses = {
    right: 'right-0',
    left: 'left-0',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute ${alignmentClasses[align]} mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50`}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export const DropdownMenuItem = ({ children, onClick, className = '' }) => {
  return (
    <button
      onClick={() => {
        onClick?.()
      }}
      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 ${className}`}
    >
      {children}
    </button>
  )
}

export const DropdownMenuSeparator = () => {
  return <div className="border-t border-gray-200 my-1" />
}
