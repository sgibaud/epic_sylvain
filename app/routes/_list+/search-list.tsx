import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { SearchBar } from '#app/components/search-bar.js'
import { prisma } from '#app/utils/db.server.js'

const UserSearchResultSchema = z.object({
	id: z.string(),
	title: z.string(),
	content: z.string()
})

const UserSearchResultsSchema = z.array(UserSearchResultSchema)

export async function loader({ request }: LoaderFunctionArgs) {
	const searchTerm = new URL(request.url).searchParams.get('search')
	if (searchTerm === '') {
		return redirect('/list')
	}

	const like = `%${searchTerm ?? ''}%`
	const rawNotes = await prisma.$queryRaw`
		SELECT Note.id, Note.title, Note.content
		FROM Note
		WHERE Note.title LIKE ${like}
		OR User.content LIKE ${like}
		-- ORDER BY (
		-- 	SELECT Note.updatedAt
		-- 	FROM Note
		-- 	WHERE Note.ownerId = User.id
		-- 	ORDER BY Note.updatedAt DESC
		-- 	LIMIT 1
		-- ) DESC
		LIMIT 50
	`

	const result = UserSearchResultsSchema.safeParse(rawNotes)
	if (!result.success) {
		return json({ status: 'error', error: result.error.message } as const, {
			status: 400,
		})
	}
	return json({ status: 'idle', notes: result.data } as const)
}

export default function SearchList() {
	const data = useLoaderData<typeof loader>()

	if (data.status === 'error') {
		console.error(data.error)
	}

	return (
		<>
			<SearchBar status={data.status} formAction='/list'/>
		</>
	)
}
