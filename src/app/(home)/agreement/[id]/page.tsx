import { CONFIG } from 'src/config-global';
import { AgreementDetailsView } from 'src/sections/agreement/view/agreement-details-view';
import { getUserAgreementHistory } from '../../../../actions/agreement-ssr';

// ----------------------------------------------------------------------

export const metadata = { title: `Agreement details - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default async function Page({ params }: Props) {
  const { id } = params;
  console.log('Fetching agreement:', id);
  try {
    // 서버 API 호출
    const userAgreement = getUserAgreementHistory(id);

    // 디버그 로그
    console.log('Fetched user agreement:', userAgreement);

    if (!userAgreement) {
      return <div>No agreement data found.</div>;
    }

    // @ts-ignore
    return <AgreementDetailsView agreementInfo={userAgreement} />;
  } catch (error) {
    console.error('Failed to load agreement:', error);
    return <div>Error loading agreement.</div>;
  }
}
