"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";

export type InlineSelectOption = {
  value: string;
  label: string;
  description?: string;
};

type InlineSelectProps = {
  id: string;
  label: string;
  name?: string;
  value: string;
  options: readonly InlineSelectOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function InlineSelect({
  id,
  label,
  name,
  value,
  options,
  onChange,
  className = "",
}: InlineSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const labelId = `${id}-label`;
  const listboxId = `${id}-options`;
  const selectedOption = options.find(option => option.value === value);
  const activeOptionId = `${id}-option-${activeIndex}`;

  const restoreFocus = () => {
    triggerRef.current?.focus({ preventScroll: true });
  };

  const close = (shouldRestoreFocus: boolean) => {
    setIsOpen(false);
    if (shouldRestoreFocus) restoreFocus();
  };

  const open = () => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  };

  const selectOption = (index: number, shouldRestoreFocus = true) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setActiveIndex(index);
    close(shouldRestoreFocus);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (options.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          open();
        } else {
          setActiveIndex(index => (index + 1) % options.length);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          open();
        } else {
          setActiveIndex(index => (index - 1 + options.length) % options.length);
        }
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        setIsOpen(true);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        setIsOpen(true);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen) {
          selectOption(activeIndex);
        } else {
          open();
        }
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          close(true);
        }
        break;
      case "Tab":
        if (isOpen) selectOption(activeIndex, false);
        break;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [isOpen]);

  return (
    <div ref={rootRef} className={`min-w-0 ${className}`}>
      <label id={labelId} htmlFor={`${id}-trigger`} className="mb-2 block text-base font-medium text-foreground">
        {label}
      </label>

      {name && <input type="hidden" name={name} value={value} />}

      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        role="combobox"
        aria-labelledby={labelId}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={isOpen ? activeOptionId : undefined}
        onClick={() => (isOpen ? close(true) : open())}
        onKeyDown={handleKeyDown}
        className="inline-flex min-h-[52px] w-full appearance-none items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-2.5 text-left text-base text-foreground transition-[border-color,background-color] hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <span className="min-w-0 flex-1 break-words">
          {selectedOption?.label ?? value}
        </span>
        <ChevronDownIcon
          className={`size-5 shrink-0 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          aria-activedescendant={activeOptionId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="mt-2 grid gap-1 rounded-xl border border-border bg-card p-1 text-card-foreground shadow-sm animate-in fade-in slide-in-from-top-1 duration-150 motion-reduce:animate-none"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <div
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event: ReactMouseEvent<HTMLDivElement>) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
                className={`flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left text-base transition-colors motion-reduce:transition-none ${
                  isActive ? "bg-secondary text-secondary-foreground" : "text-foreground hover:bg-secondary/70"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  <span className={isSelected ? "font-semibold" : "font-medium"}>{option.label}</span>
                  {option.description && (
                    <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{option.description}</span>
                  )}
                </span>
                <span className="flex size-5 shrink-0 items-center justify-center text-primary" aria-hidden="true">
                  {isSelected && <CheckIcon className="size-4" />}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
