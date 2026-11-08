import type { Metadata } from 'next';
import CVPage from '@/components/pages/CVPage';

export const metadata: Metadata = {
    title: 'Curriculum Vitae',
};

export default function CurriculumVitaePage() {
    return <CVPage />;
}
