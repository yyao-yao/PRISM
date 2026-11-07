import type { ReactNode } from 'react';

/** The same title/author/venue markup used by About's Selected Publications. */
export default function AcademicEntryText({ title, authors, supporting }: {
    title: ReactNode;
    authors?: ReactNode;
    supporting: ReactNode;
}) {
    return <>
        <h3 className="font-semibold text-primary mb-2 leading-tight">{title}</h3>
        {authors && <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-1">{authors}</p>}
        <p data-entry-support className="text-sm text-neutral-600 dark:text-neutral-500 mb-2">{supporting}</p>
    </>;
}
