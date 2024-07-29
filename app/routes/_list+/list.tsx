import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.js'

import { getUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'

import TableList from './table'

type NoteProps = {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
}[];

type LoaderData = {
    notes: NoteProps;
    page: number;
    totalPages: number;
    user?: string,
};

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getUserId(request);

    if (!user) {
        throw new Response('Not Found', { status: 404 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = 4;

    const [notes, totalNotes] = await Promise.all([
        prisma.note.findMany({
            take: pageSize,
            skip: (page - 1) * pageSize,
            where: {
                ownerId: user,
            },
            orderBy: { title: 'asc' },
        }),
        prisma.note.count({ where: { ownerId: user } }),
    ]);

    const totalPages = Math.ceil(totalNotes / pageSize);
    return json<LoaderData>({ notes, page, totalPages });
}

export default function ListPage() {
    const { notes, page, totalPages } = useLoaderData<LoaderData>();

    return (
        <div className="flex flex-col gap-y-4 lg:container">
            <div>
                <p className="mb-5 mt-10 flex justify-center text-2xl font-bold">
                    Articles
                </p>
            </div>
            <TableList notes={notes} page={page} totalPages={totalPages} />
        </div>
    );
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
