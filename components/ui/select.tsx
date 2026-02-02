'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

/* ===================== ROOT ===================== */

export function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return (
    <>
      <PremiumSelectStyles />
      <SelectPrimitive.Root {...props} />
    </>
  )
}

export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

/* ===================== TRIGGER ===================== */

export function SelectTrigger({
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger className="select-trigger" {...props}>
      {children}
      <SelectPrimitive.Icon>
        <ChevronDownIcon size={16} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/* ===================== CONTENT ===================== */

export function SelectContent({
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className="select-content" {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className="select-viewport">
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

/* ===================== LABEL ===================== */

export function SelectLabel(
  props: React.ComponentProps<typeof SelectPrimitive.Label>
) {
  return <SelectPrimitive.Label className="select-label" {...props} />
}

/* ===================== ITEM ===================== */

export function SelectItem({
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item className="select-item" {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="select-check">
        <CheckIcon size={16} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

/* ===================== SEPARATOR ===================== */

export function SelectSeparator(
  props: React.ComponentProps<typeof SelectPrimitive.Separator>
) {
  return <SelectPrimitive.Separator className="select-separator" {...props} />
}

/* ===================== SCROLL ===================== */

function SelectScrollUpButton() {
  return (
    <SelectPrimitive.ScrollUpButton className="select-scroll">
      <ChevronUpIcon size={16} />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton() {
  return (
    <SelectPrimitive.ScrollDownButton className="select-scroll">
      <ChevronDownIcon size={16} />
    </SelectPrimitive.ScrollDownButton>
  )
}

/* ===================== PREMIUM CSS ===================== */

function PremiumSelectStyles() {
  return (
    <style>{`
      :root {
        --bg: #ffffff;
        --bg-muted: #f4f4f5;
        --border: #e4e4e7;
        --text: #18181b;
        --muted: #71717a;
        --primary: #18181b;
        --ring: rgba(0,0,0,.15);
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #09090b;
          --bg-muted: #18181b;
          --border: #27272a;
          --text: #fafafa;
          --muted: #a1a1aa;
          --primary: #fafafa;
          --ring: rgba(255,255,255,.2);
        }
      }

      /* ===== Trigger ===== */
      .select-trigger {
        all: unset;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
        height: 42px;
        padding: 0 14px;
        border-radius: 10px;
        background: var(--bg);
        color: var(--text);
        border: 1px solid var(--border);
        font-size: 14px;
        cursor: pointer;
        transition: all .2s ease;
      }

      .select-trigger:hover {
        background: var(--bg-muted);
      }

      .select-trigger:focus-visible {
        box-shadow: 0 0 0 3px var(--ring);
      }

      /* ===== Content ===== */
      .select-content {
        background: var(--bg);
        border-radius: 14px;
        border: 1px solid var(--border);
        box-shadow:
          0 20px 40px rgba(0,0,0,.12),
          0 5px 15px rgba(0,0,0,.08);
        overflow: hidden;
        animation: fadeZoom .18s ease-out;
        z-index: 50;
      }

      @keyframes fadeZoom {
        from { opacity: 0; transform: scale(.96) translateY(-4px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      .select-viewport {
        padding: 6px;
      }

      /* ===== Item ===== */
      .select-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 14px;
        color: var(--text);
        cursor: pointer;
        transition: background .15s ease;
      }

      .select-item:hover,
      .select-item[data-highlighted] {
        background: var(--bg-muted);
      }

      .select-item[data-state="checked"] {
        background: var(--primary);
        color: var(--bg);
      }

      .select-check {
        opacity: .9;
      }

      /* ===== Label ===== */
      .select-label {
        padding: 6px 10px;
        font-size: 12px;
        color: var(--muted);
      }

      /* ===== Separator ===== */
      .select-separator {
        height: 1px;
        margin: 6px 0;
        background: var(--border);
      }

      /* ===== Scroll ===== */
      .select-scroll {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        color: var(--muted);
      }
    `}</style>
  )
}
