import { hasOfficialCv } from '@/lib/cv';
import DigitalEntrance from '@/components/entrance/DigitalEntrance';

export default function Home() {
  return <DigitalEntrance cvAvailable={hasOfficialCv()} />;
}
