import { type Note } from '@prisma/client'
import { Link } from '@remix-run/react'
import { ChevronRightIcon, ChevronLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.js'
import { Button } from '#app/components/ui/button'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table.tsx'
import SearchList from './search-list'

type TableListProps = {
	notes: String
	page: number
	totalPages: number
}

export default function TableList({ notes, page, totalPages }: TableListProps) {
	const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

	const handleRowClick = (noteId: string) => {
		setSelectedNoteId(noteId)
	}

	const selectedNote: Note | undefined = notes.find((note) => note.id === selectedNoteId)

	const tableRow: Note[] = notes.map((m) => (
		<>
			<TableRow onClick={() => handleRowClick(m.id)}>
				<TableCell className="font-medium">{m.title}</TableCell>
				<TableCell className="... overflow-hidden truncate">
					{m.content}
				</TableCell>
				<TableCell>{new Date(m.createdAt).toLocaleDateString()}</TableCell>
				<TableCell>{new Date(m.updatedAt).toLocaleDateString()}</TableCell>
			</TableRow>
		</>
	))

	return (
		<>
			<div className="flex flex-col gap-y-4 lg:container">
				<div className="flex items-center justify-between">
					<div>
						<SearchList />
					</div>
					<div className="flex items-center gap-x-4">
						{page > 1 && (
							<Button variant="outline" className="h-8 w-8 p-0">
								<Link to={`?page=${page - 1}`}>
									<ChevronLeftIcon className="h-4 w-4" />
								</Link>
							</Button>
						)}
						<div>
							<p>{page}</p>
						</div>
						{page < totalPages && (
							<Button variant="outline" className="h-8 w-8 p-0">
								<Link to={`?page=${page + 1}`}>
									<ChevronRightIcon className="h-4 w-4" />
								</Link>
							</Button>
						)}
					</div>
				</div>
				<div>
					<Table className="table-fixed">
						<TableHeader>
							<TableRow>
								<TableHead className="w-[250px]">Titre</TableHead>
								<TableHead className="max-w-[400px]">Contenu</TableHead>
								<TableHead className="w-[175px]">Date de création</TableHead>
								<TableHead className="w-[175px]">Date de mise à jour</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>{tableRow}</TableBody>
					</Table>
				</div>
				{selectedNote && (
					<div className="mt-4 rounded border p-4 bg-gray-50">
						<h2 className="mb-2 text-xl font-bold">{selectedNote.title}</h2>
						<p>{selectedNote.content}</p>
						<div className='flex flex-col gap-y-2 mt-4'>
							<p className="text-sm text-gray-500">
								Créé le :{' '}
								{new Date(selectedNote.createdAt).toLocaleDateString()}
							</p>
							<p className="text-sm text-gray-500">
								Mis à jour le :{' '}
								{new Date(selectedNote.updatedAt).toLocaleDateString()}
							</p>
						</div>
					</div>
				)}
			</div>
		</>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}
