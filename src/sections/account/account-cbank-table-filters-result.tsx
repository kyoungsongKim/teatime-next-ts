import { cbankTypeLabels, ICbankTableFilters } from 'src/types/cbank';
import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'src/hooks/use-set-state';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

import { workTypeLabels } from 'src/types/attendance';

// ----------------------------------------------------------------------

type Props = {
  totalResults: number;
  sx?: SxProps<Theme>;
  onResetPage: () => void;
  filters: UseSetStateReturn<ICbankTableFilters>;
};

export function AccountCbankTableFiltersResult({ filters, totalResults, onResetPage, sx }: Props) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ keyword: '' });
  }, [filters, onResetPage]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    filters.setState({ type: 'all' });
  }, [filters, onResetPage]);

  const handleRemoveDate = useCallback(() => {
    onResetPage();
    filters.setState({ transferStartDate: null, transferEndDate: null });
  }, [filters, onResetPage]);

  const handleReset = useCallback(() => {
    onResetPage();
    filters.onResetState();
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="이체 종류:" isShow={filters.state.type !== 'all'}>
        <Chip
          {...chipProps}
          label={cbankTypeLabels[filters.state.type]}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock
        label="Date:"
        isShow={Boolean(filters.state.transferStartDate && filters.state.transferEndDate)}
      >
        <Chip
          {...chipProps}
          label={fDateRangeShortLabel(
            filters.state.transferStartDate,
            filters.state.transferEndDate
          )}
          onDelete={handleRemoveDate}
        />
      </FiltersBlock>

      <FiltersBlock label="Keyword:" isShow={!!filters.state.keyword}>
        <Chip {...chipProps} label={filters.state.keyword} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
