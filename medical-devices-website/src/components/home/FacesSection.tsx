import { HomeSectionService } from '@/services/homeSection.service';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { FacesBehindDevice } from './FacesBehindDevice';

export async function FacesSection() {
  const locale = await getLocale();
  const facesBehindDeviceSection = await HomeSectionService.getLocalizedByKey('faces', locale);

  return <FacesBehindDevice data={facesBehindDeviceSection} />;
}
