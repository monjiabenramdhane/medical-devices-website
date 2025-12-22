import { FooterConfigForm } from '@/components/admin/forms/FooterConfigForm';
import { FooterSectionList } from '@/components/admin/forms/FooterSectionList';

export const metadata = {
  title: 'Footer Management | Admin',
};

export default function FooterAdminPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#02445b] ">Footer Management</h1>
      </div>
      <div className="space-y-6">
        <FooterConfigForm />
        <FooterSectionList />
      </div>
    </>
  );
}
