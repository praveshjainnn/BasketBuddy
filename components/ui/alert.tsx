"use client"

import React from "react"

export function Alert({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "destructive" }) {
	const styles = variant === "destructive" ? "border-red-300 bg-red-50 text-red-700" : "border-border bg-muted/30"
	return <div className={`border rounded-md p-3 ${styles}`}>{children}</div>
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
	return <div className="text-sm">{children}</div>
}


