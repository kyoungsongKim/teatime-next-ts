import { CONFIG } from 'src/config-global';
import { AgreementDetailsView } from 'src/sections/agreement/view/agreement-details-view';
import { getUserAgreementDetail, getUserAgreementHistory } from '../../../../actions/agreement-ssr';

// ----------------------------------------------------------------------

export const metadata = { title: `Agreement details - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default async function Page({ params }: Props) {
  const { id } = params;
  return <AgreementDetailsView id={id} />;
}
