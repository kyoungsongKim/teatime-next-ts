import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'src/hooks/use-set-state';
import type { INotificationTableFilters } from 'src/types/notification';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = {
  totalResults: number;
  sx?: SxProps<Theme>;
  onResetPage: () => void;
  filters: UseSetStateReturn<INotificationTableFilters>;
};

export function NotificationsTableFiltersResult({ filters, totalResults, onResetPage, sx }: Props) {
  const handleKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ keyword: '' });
  }, [filters, onResetPage]);

  const handleReset = useCallback(() => {
    onResetPage();
    filters.onResetState();
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Kerword:" isShow={!!filters.state.keyword}>
        <Chip {...chipProps} label={filters.state.keyword} onDelete={handleKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
