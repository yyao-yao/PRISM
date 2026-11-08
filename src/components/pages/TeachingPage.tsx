import type { CardPageConfig } from '@/types/page';
import styles from './TeachingPage.module.css';

/** Traditional academic appointments, with recognition and courses nested in place. */
export default function TeachingPage({ config }: { config: CardPageConfig }) {
    return <div className={styles.page} data-teaching-page>
        <h1 className={styles.title}>{config.title}</h1>
        <h2>{config.description}</h2>
        {config.teaching?.map(section => <section key={section.id} className={styles.section} aria-labelledby={section.id}>
            <h3 id={section.id}>{section.title}</h3>
            <ul className={styles.appointments}>
                {section.items.map(item => <li key={`${item.institution}-${item.title}`} data-teaching-appointment>
                    {item.title === item.institution ? <>{item.institution}, {item.semester}.</>
                        : <>{item.title}, Undergraduate, {item.institution}, {item.semester}.</>}
                    {item.recognition && <ul><li data-teaching-recognition>{item.recognition}, {item.recognition_institution}.</li></ul>}
                    {item.courses && <ul><li><strong>{item.courses_label}:</strong> {item.courses.join('; ')}.</li></ul>}
                </li>)}
            </ul>
        </section>)}
    </div>;
}
