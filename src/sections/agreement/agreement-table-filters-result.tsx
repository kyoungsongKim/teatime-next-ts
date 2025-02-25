import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'src/hooks/use-set-state';
import type { IAgreementTableFilters } from 'src/types/agreement';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = {
  totalResults: number;
  sx?: SxProps<Theme>;
  onResetPage: () => void;
  filters: UseSetStateReturn<IAgreementTableFilters>;
};

export function AgreementTableFiltersResult({ filters, totalResults, onResetPage, sx }: Props) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ realName: '' });
  }, [filters, onResetPage]);

  const handleReset = useCallback(() => {
    onResetPage();
    filters.onResetState();
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Keyword:" isShow={!!filters.state.realName}>
        <Chip {...chipProps} label={filters.state.realName} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
