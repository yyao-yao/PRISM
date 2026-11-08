'use client';

import { useEffect, useState } from 'react';
import { useLocaleStore } from '@/lib/stores/localeStore';
import styles from './CVPage.module.css';

export default function CVPage() {
    const zh = useLocaleStore(state => state.locale).startsWith('zh');
    const [canEmbed, setCanEmbed] = useState<boolean | null>(null);
    const title = zh ? '学术简历' : 'Curriculum Vitae';

    useEffect(() => {
        setCanEmbed(navigator.pdfViewerEnabled ?? true);
    }, []);

    return <section className={styles.page} data-cv-page>
        <div className={styles.heading}>
            <h1>{title}</h1>
            <a className={styles.download} href="/cv.pdf" download="Yao_Yao_CV.pdf">
                {zh ? '下载 PDF' : 'Download PDF'}
            </a>
        </div>
        {canEmbed && <iframe
            className={styles.viewer}
            src="/cv.pdf"
            title={title}
            aria-describedby="cv-pdf-fallback"
        />}
        <p className={styles.fallback} id="cv-pdf-fallback">
            {canEmbed === false && <>{zh ? '此浏览器不支持 PDF 预览。' : 'PDF preview is unavailable in this browser. '}</>}
            <a href="/cv.pdf">{zh ? '打开 PDF' : 'Open PDF'}</a>
        </p>
    </section>;
}
