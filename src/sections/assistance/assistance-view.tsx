'use client';

import type { ApplyItem, AssistanceItem } from 'src/types/assistance';

import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { getUserInfo } from 'src/utils/user-info';

import { DashboardContent } from 'src/layouts/dashboard';
import { getApplyList } from 'src/actions/assistance-ssr';

import { Label } from 'src/components/label';

import { AppliedServiceTable } from 'src/sections/assistance/applied-service-table';
import { AssistanceServiceList } from 'src/sections/assistance/assistance-service-list';
import { AppliedServiceAdminTable } from 'src/sections/assistance/applied-service-admin-table';
import { AssistanceReviewDialog } from 'src/sections/assistance/dialog/assistance-review-dialog';

import { useAuthContext } from 'src/auth/hooks';
import { AssistanceFormDialog } from 'src/sections/assistance/dialog/assistance-form-dialog';
import { AssistanceSuggestionDialog } from 'src/sections/assistance/dialog/assistance-suggestion-dialog';

export function AssistanceView() {
  const { user } = useAuthContext();
  const { id, auth } = useMemo(() => getUserInfo(user), [user]);

  const suggestionFormOpen = useBoolean();
  const serviceFormOpen = useBoolean();
  const reviewFormOpen = useBoolean();
  const editable = useBoolean();

  const [appliedServiceList, setAppliedServiceList] = useState<ApplyItem[]>([]);
  const [appliedServiceListAll, setAppliedServiceListAll] = useState<ApplyItem[]>([]);

  const [formItem, setFormItem] = useState<AssistanceItem>();
  const [appliedServiceItem, setAppliedServiceItem] = useState<ApplyItem>();

  const getAppliedServiceList = useCallback(() => {
    getApplyList().then((r) => {
      if (r.status === 200) {
        const { data } = r;
        const keys = Object.keys(data);
        if (keys.includes('my')) setAppliedServiceList(data.my);
        if (keys.includes('all') && auth === 'ADMIN') setAppliedServiceListAll(data.all);
      }
    });
  }, [auth]);

  const onOpenForm = (service: AssistanceItem) => {
    editable.onTrue();
    setFormItem(service);
    serviceFormOpen.onTrue();
  };

  const makeFormItem = useCallback((row: ApplyItem) => {
    const resultItem: AssistanceItem = {
      id: row.id,
      name: row.assistance.name,
      price: row.assistance.price,
      description: row.assistance.description,
      groupId: row.assistance.groupId,
      form: row.content,
      files: row.files,
    };

    return resultItem;
  }, []);

  useEffect(() => {
    getAppliedServiceList();
  }, [getAppliedServiceList]);

  return (
    <>
      <DashboardContent maxWidth="xl">
        <Grid container spacing={3}>
          <AssistanceServiceList
            onOpenForm={onOpenForm}
            onSuggestionOpen={suggestionFormOpen.onTrue}
          />
          <Grid xs={12} sm={12} md={12} alignSelf="center" display="inner-flex">
            <Typography variant="subtitle1">신청한 비서 서비스 목록</Typography>
            <Typography variant="body2">({appliedServiceList.length})</Typography>
          </Grid>

          <Grid xs={12} sm={12} md={12}>
            {/* 신청한 서비스 목록 */}
            <AppliedServiceTable
              item={appliedServiceList}
              detailOpen={(row: ApplyItem) => {
                editable.onFalse();
                setFormItem(makeFormItem(row));
                serviceFormOpen.onTrue();
              }}
              reviewOpen={(row: ApplyItem) => {
                editable.onFalse();
                setAppliedServiceItem(row);
                reviewFormOpen.onTrue();
              }}
            />
          </Grid>
          {auth === 'ADMIN' && (
            <>
              <Grid xs={12} sm={12} md={12} display="inner-flex" alignItems="center">
                {/* 관리자 메뉴 - 신청된 비서 서비스 타이틀 */}
                <Typography variant="subtitle1">
                  <Label color="primary" variant="soft" mr={1}>
                    관리자 메뉴
                  </Label>
                  신청된 비서 서비스 목록
                </Typography>
                <Typography variant="body2">({appliedServiceListAll.length})</Typography>
              </Grid>
              <Grid xs={12} sm={12} md={12}>
                {/* 관리자 메뉴 - 신청된 비서 서비스 목록 */}
                <AppliedServiceAdminTable
                  item={appliedServiceListAll}
                  onUpdate={getAppliedServiceList}
                  detailOpen={(row: ApplyItem) => {
                    editable.onFalse();
                    setFormItem(makeFormItem(row));
                    serviceFormOpen.onTrue();
                  }}
                  onReviewOpen={(row: ApplyItem) => {
                    setAppliedServiceItem(row);
                    reviewFormOpen.onTrue();
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DashboardContent>
      <AssistanceSuggestionDialog
        open={suggestionFormOpen.value}
        onClose={suggestionFormOpen.onFalse}
      />
      <AssistanceFormDialog
        id={id}
        auth={auth}
        item={formItem}
        editable={editable.value}
        onUpdate={getAppliedServiceList}
        onClose={serviceFormOpen.onFalse}
        open={serviceFormOpen.value}
      />
      <AssistanceReviewDialog
        open={reviewFormOpen.value}
        id={id}
        auth={auth}
        item={appliedServiceItem}
        onClose={reviewFormOpen.onFalse}
        onUpdate={getAppliedServiceList}
      />
    </>
  );
}
