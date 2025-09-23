"use client"

import React from "react"

export function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (c: boolean) => void }) {
	return (
		<button
			role="switch"
			aria-checked={checked}
			onClick={() => onCheckedChange(!checked)}
			className={`w-10 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
		>
			<span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
		</button>
	)
}


