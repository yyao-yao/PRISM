"use client";

import { useId, useState } from 'react';
import { DocumentTextIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import type { Author, Publication } from '@/types/publication';
import type { PublicationPageConfig } from '@/types/page';
import FormattedBibTeXText from './FormattedBibTeXText';
import styles from './ResearchPage.module.css';

function editorNames(publication: Publication) {
    const names = publication.editors?.map(editor => editor.name) || [];
    return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

function editionLabel(edition: string) {
    const n = Number(edition);
    if (!Number.isInteger(n)) return `${edition} edition`;
    const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
    return `${n}${suffix} edition`;
}

/** Uses structured BibTeX fields; formatted citation strings are never parsed. */
function PublicationDetails({ publication: p }: { publication: Publication }) {
    const pages = p.pages?.replace(/--/g, '–');
    return <>
        {p.journal ? <><em>{p.journal}</em>{p.volume && ` ${p.volume}`}{p.issue && `(${p.issue})`}{pages && `: ${pages}`}.</>
            : <>{p.editors?.length ? 'In ' : ''}<em>{p.conference}</em>{p.edition && `, ${editionLabel(p.edition)}`}{p.editors?.length ? `, edited by ${editorNames(p)}.` : ','}{pages && ` ${pages}.`}{p.address && ` ${p.address}:`}{p.publisher && ` ${p.publisher}.`}</>}
        {p.language === 'Chinese' && ' (In Chinese)'}
    </>;
}

export function MaterialControls({ paper, abstract, pending, zh }: { paper?: string; abstract?: string; pending: boolean; zh: boolean }) {
    const [open, setOpen] = useState(false);
    const id = useId();
    if (!(pending && paper) && !abstract) return null;
    return <>
        <div className={styles.controls}>
            {pending && paper && <a href={paper} target="_blank" rel="noopener noreferrer"><DocumentTextIcon />{zh ? '论文' : 'Paper'}</a>}
            {abstract && <button aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
                <BookOpenIcon />{zh ? '摘要' : 'Abstract'}
            </button>}
        </div>
        {abstract && open && <div id={id} className={styles.abstract}><p>{abstract}</p></div>}
    </>;
}

function citationName(name: string, first: boolean) {
    if (!first || name.includes(',')) return name;
    const parts = name.trim().split(/\s+/);
    return parts.length > 1 ? `${parts.at(-1)}, ${parts.slice(0, -1).join(' ')}` : name;
}

function CitationAuthors({ authors }: { authors: Author[] }) {
    return <>{authors.map((author, index) => <span key={index}>
        {index > 0 && (index === authors.length - 1 ? ', and ' : ', ')}
        <span data-citation-author className={author.name.replace(/[,\s]/g, '').toLowerCase() === 'yaoyao' ? styles.owner : undefined}>
            {citationName(author.name, index === 0)}
        </span>
    </span>)}</>;
}

export default function ResearchPage({ config, publications }: { config: PublicationPageConfig; publications: Publication[] }) {
    const research = config.research;
    if (!research) return null;
    return <div className={styles.page} data-research-page>
        <h1 className={styles.title}>{config.title}</h1>
        {research.categories.map(category => <section key={category.id} className={styles.section} aria-labelledby={`research-${category.id}`}>
            <h2 id={`research-${category.id}`}>{category.title}</h2>
            <div className={styles.entries}>
                {publications.filter(p => p.category === category.id).sort((a, b) => b.year - a.year).map(p => <article key={p.id} className={styles.entry} data-publication={p.id}>
                    <h3>{p.doi
                        ? <a className={styles.publicationLink} href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer"><FormattedBibTeXText nodes={p.titleNodes} fallback={p.title} /></a>
                        : <FormattedBibTeXText nodes={p.titleNodes} fallback={p.title} />}</h3>
                    <p data-publication-authors><CitationAuthors authors={p.authors} />. {p.year}.</p>
                    <p data-publication-details><PublicationDetails publication={p} /></p>
                </article>)}
            </div>
        </section>)}
        {research.sections.map(section => <section key={section.id} className={styles.section} aria-labelledby={section.id}>
            <h2 id={section.id}>{section.title}</h2>
            <div className={styles.entries}>
                {section.items.map(item => <article key={item.title} className={styles.entry}>
                    <h3>{item.title}</h3>
                    {section.id === 'research-honors' && <>
                        <p>{item.details.replace(/ · /g, ', ')}.</p>
                        <p>{item.recognition}.</p>
                    </>}
                </article>)}
            </div>
        </section>)}
    </div>;
}
