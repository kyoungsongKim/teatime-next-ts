'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { DashboardContent } from 'src/layouts/dashboard';

import { FaqsList } from '../faqs-list';
import { getFaqs } from '../../../actions/faq-ssr';
import { useAuthContext } from '../../../auth/hooks';
import { Iconify } from '../../../components/iconify';
import { getUserInfo } from '../../../utils/user-info';
import { useBoolean } from '../../../hooks/use-boolean';
import { FaqsEditDialog } from '../dialog/faqs-edit-dialog';
import { FaqsCreateDialog } from '../dialog/faqs-create-dialog';

import type { FaqsItem } from '../../../types/faqs';

// ----------------------------------------------------------------------

export function FaqsView() {
  const [faqs, setFaqs] = useState<FaqsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 정보 불러오기
  const { user } = useAuthContext();
  const { id, auth } = useMemo(() => getUserInfo(user), [user]);

  // create faq dialog open/close
  const createDialog = useBoolean();
  // edit faq dialog open/close
  const editDialog = useBoolean();

  const fetchFaqList = useCallback(() => {
    getFaqs()
      .then((r) => {
        setFaqs(r.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const updateFaqsList = (updatedFaqs: FaqsItem[]) => {
    setFaqs(updatedFaqs);
  };

  useEffect(() => {
    fetchFaqList();
  }, [fetchFaqList]);

  return (
    <>
      <DashboardContent maxWidth="xl">
        {auth === 'ADMIN' && (
          <Stack spacing={2.5} sx={{ mb: { xs: 2, md: 3 } }}>
            <Stack
              spacing={3}
              justifyContent="flex-end"
              alignItems={{ xs: 'flex-end', sm: 'center' }}
              direction={{ xs: 'row', sm: 'row' }}
            >
              <Stack direction="row" spacing={1} flexShrink={0}>
                <Button
                  variant="soft"
                  color="primary"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={createDialog.onTrue}
                >
                  Create FAQ
                </Button>
                <Button variant="soft" color="error" onClick={editDialog.onTrue}>
                  Edit FAQ
                </Button>
              </Stack>
            </Stack>
          </Stack>
        )}

        <Box gap={1} display="grid" gridTemplateColumns="repeat(1, 1fr)">
          {loading && <p>Loading FAQs...</p>}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          {!loading && !error && <FaqsList faqs={faqs} />}
        </Box>
      </DashboardContent>
      <FaqsCreateDialog
        open={createDialog.value}
        onClose={() => {
          createDialog.onFalse();
          fetchFaqList();
        }}
      />
      <FaqsEditDialog
        open={editDialog.value}
        faqs={faqs}
        onClose={() => {
          editDialog.onFalse();
          fetchFaqList();
        }}
        onFaqsUpdate={updateFaqsList}
      />
    </>
  );
}
