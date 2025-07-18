import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";

const PortalDropdown = ({ buttonContent, children }) => {
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        ref={buttonRef}
        onClick={toggleDropdown}
      >
        <i className="bi bi-funnel me-2"></i>
        {buttonContent}
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            className="dropdown-menu show"
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
};

export default PortalDropdown;
