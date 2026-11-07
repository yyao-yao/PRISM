import type { CardPageConfig } from '@/types/page';
import AcademicEntryText from '@/components/publications/AcademicEntryText';

/** Reuse About's academic entry hierarchy; each section supplies the role. */
export default function TeachingPage({ config }: { config: CardPageConfig }) {
    return (
        <div>
            <div data-academic="page-heading" className="mb-8">
                <h1 className="text-4xl font-serif font-bold text-primary mb-4">{config.title}</h1>
            </div>
            {config.teaching?.map(section => (
                <section key={section.id} data-academic="section" aria-labelledby={section.id} className="mt-10">
                    <h2 id={section.id} className="text-2xl font-serif font-bold text-primary mb-6">{section.title}</h2>
                    <div data-academic="papers">
                        {section.items.map(item => (
                            <article key={`${item.institution}-${item.title}`} data-academic="paper">
                                <AcademicEntryText title={item.title}
                                    authors={item.institution !== item.title ? item.institution : undefined}
                                    supporting={<>{item.semester}{item.level && <> · {item.level}</>}</>} />
                                {item.recognition && (
                                    <div data-teaching-recognition className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed mt-2">
                                        {item.recognition}<br />{item.recognition_institution}
                                    </div>
                                )}
                                {item.courses && (
                                    <div className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed mt-2">
                                        <span>{item.courses_label}:</span>
                                        <ul className="list-disc pl-5 space-y-1 mt-2">
                                            {item.courses.map(course => <li key={course}>{course}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
