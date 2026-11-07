import type { CardPageConfig } from '@/types/page';

/** Teaching-only text listing using the approved academic typography and rules. */
export default function TeachingPage({ config }: { config: CardPageConfig }) {
    return (
        <div data-academic="courses">
            <div data-academic="page-heading" className="mb-8">
                <h1 className="text-4xl font-serif font-bold text-primary mb-4">{config.title}</h1>
            </div>
            {config.teaching?.map(section => (
                <section key={section.id} aria-labelledby={section.id} className="mt-10">
                    <h2 id={section.id} className="text-2xl font-serif font-bold text-primary mb-6">{section.title}</h2>
                    <div data-academic="course-list">
                        {section.items.map(item => (
                            <article key={`${item.institution}-${item.title}`} data-academic="course">
                                <div data-academic="course-heading" className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                    <h3 className="font-semibold text-primary">{item.title}</h3>
                                    <span data-academic="course-date">{item.semester}</span>
                                </div>
                                <p>{item.institution === item.title ? item.role : `${item.institution} · ${item.role}`}</p>
                                {item.level && <div data-academic="course-tags"><span>{item.level}</span></div>}
                                {item.recognition && (
                                    <div data-teaching-recognition className="mt-6 text-sm leading-relaxed">
                                        <p className="font-medium">{item.recognition}</p>
                                        <p>{item.recognition_institution}</p>
                                    </div>
                                )}
                                {item.courses && (
                                    <div className="text-sm leading-relaxed">
                                        <p className="mb-2">{item.courses_label}:</p>
                                        <ul className="list-disc pl-5 space-y-1">
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
