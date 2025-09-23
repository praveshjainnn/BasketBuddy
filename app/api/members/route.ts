export const dynamic = "force-dynamic"

let members = [
	{ id: "1", name: "Mom", email: "mom@family.com", avatar: "M" },
	{ id: "2", name: "Dad", email: "dad@family.com", avatar: "D" },
	{ id: "3", name: "Alex", email: "alex@family.com", avatar: "A" },
]

export async function GET() {
	return new Response(JSON.stringify(members), { status: 200, headers: { "content-type": "application/json" } })
}

export async function POST(request: Request) {
	const body = await request.json()
	const newMember = { id: Date.now().toString(), ...body }
	members.push(newMember)
	return new Response(JSON.stringify(newMember), { status: 201, headers: { "content-type": "application/json" } })
}

export async function PATCH(request: Request) {
	const body = await request.json()
	const { id, updates } = body
	members = members.map((m) => (m.id === id ? { ...m, ...updates } : m))
	return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } })
}

export async function DELETE(request: Request) {
	const { searchParams } = new URL(request.url)
	const id = searchParams.get("id")
	if (!id) return new Response(JSON.stringify({ error: "id is required" }), { status: 400 })
	members = members.filter((m) => m.id !== id)
	return new Response(null, { status: 204 })
}
