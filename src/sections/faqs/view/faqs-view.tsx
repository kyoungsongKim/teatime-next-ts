'use client';

import type { FaqsItem } from 'src/types/faqs';

import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { useBoolean } from 'src/hooks/use-boolean';

import { getFaqs } from 'src/actions/faq-ssr';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { useUser } from 'src/auth/context/user-context';

import { FaqsList } from '../faqs-list';
import { FaqsEditDialog } from '../dialog/faqs-edit-dialog';
import { FaqsCreateDialog } from '../dialog/faqs-create-dialog';

// ----------------------------------------------------------------------

export function FaqsView() {
  const [faqs, setFaqs] = useState<FaqsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 정보 불러오기
  const { isAdmin } = useUser();

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

  const updateList = (updatedFaqs: FaqsItem[]) => {
    setFaqs(updatedFaqs);
  };

  useEffect(() => {
    fetchFaqList();
  }, [fetchFaqList]);

  return (
    <>
      <DashboardContent maxWidth="xl">
        {isAdmin && (
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
        onUpdate={updateList}
      />
    </>
  );
}
