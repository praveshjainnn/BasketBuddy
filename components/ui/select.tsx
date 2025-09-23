"use client"

import React, { createContext, useContext, useMemo, useState } from "react"

type SelectContextValue = {
	value?: string
	setValue: (v: string) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

export function Select({ value, onValueChange, children }: { value?: string; onValueChange?: (v: string) => void; children: React.ReactNode }) {
	const [internal, setInternal] = useState<string | undefined>(value)
	const setValue = (v: string) => {
		setInternal(v)
		onValueChange?.(v)
	}
	const ctx = useMemo(() => ({ value: value ?? internal, setValue }), [value, internal])
	return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>
}

export function SelectTrigger({ children, className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
	return (
		<button type="button" className={className} {...props}>
			{children}
		</button>
	)
}

export function SelectValue() {
	const ctx = useContext<SelectContextValue | null>(SelectContext)
	return <span>{ctx?.value ?? "Select"}</span>
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={className}>{children}</div>
}

export function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
	const ctx = useContext<SelectContextValue | null>(SelectContext)
	return (
		<button
			type="button"
			className={className}
			onClick={() => {
				ctx?.setValue(value)
			}}
		>
			{children}
		</button>
	)
}


