import React, { useState, useEffect, useRef } from 'react';

function CustomDropdown({ value, options, onChange, optionStyles = {}, variant = 'badge', getLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const toLabel = getLabel || ((v) => v);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => { onChange(option); setIsOpen(false); };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setIsOpen(false); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(p => !p); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = options.indexOf(value);
      onChange(options[(i + 1) % options.length]);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = options.indexOf(value);
      onChange(options[(i - 1 + options.length) % options.length]);
    }
  };

  const triggerStyle = variant === 'pill'
    ? {
        background: 'white',
        border: '1px solid #EAEEF4',
        padding: '7px 26px 7px 12px',
        borderRadius: '70px',
        fontWeight: '600',
        fontSize: '13px',
        color: '#092C4C',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }
    : {
        ...(optionStyles[value] || {}),
        padding: '5px 26px 5px 10px',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        userSelect: 'none',
        minWidth: '110px',
        whiteSpace: 'nowrap',
      };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(p => !p)}
        onKeyDown={handleKeyDown}
        style={triggerStyle}
      >
        {toLabel(value)}
        <span style={{ position: 'absolute', right: '9px', fontSize: '9px', opacity: 0.5 }}>▾</span>
      </div>

      {isOpen && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 200,
            background: 'white',
            border: '1px solid #EAEEF4',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
            padding: '6px',
            margin: 0,
            listStyle: 'none',
            minWidth: '100%',
          }}
        >
          {options.map(option => (
            <li
              key={option}
              role="option"
              aria-selected={option === value}
              onClick={() => handleSelect(option)}
              style={{
                ...(optionStyles[option] || {}),
                padding: '7px 12px',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              {toLabel(option)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomDropdown;
