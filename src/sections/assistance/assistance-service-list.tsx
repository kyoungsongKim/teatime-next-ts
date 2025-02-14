import type { AssistanceItem, AssistanceGroupItem } from 'src/types/assistance';

import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Tabs } from '@mui/material';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { getAssistanceList, getAssistanceGroupList } from 'src/actions/assistance-ssr';

const DEFAULT_ASSISTANCE_GROUP: AssistanceGroupItem = {
  id: -1,
  name: '기타 서비스',
  order: 99,
  services: [],
};

type Props = {
  onOpenForm: (service: AssistanceItem) => void;
  onSuggestionOpen: () => void;
};

export function AssistanceServiceList({ onOpenForm, onSuggestionOpen }: Props) {
  const [groupList, setGroupList] = useState<AssistanceGroupItem[]>([]);
  const [serviceList, setServiceList] = useState<AssistanceItem[]>([]);

  const [selectedTab, setSelectedTab] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const getGroupList = useCallback(() => {
    // 두 API 호출을 병렬로 실행
    Promise.all([getAssistanceGroupList(), getAssistanceList()]).then(
      ([groupResponse, serviceResponse]) => {
        if (groupResponse.status === 200 && serviceResponse.status === 200) {
          // 그룹 데이터를 정렬
          const groupData = groupResponse.data as AssistanceGroupItem[];
          const sortedGroups = groupData.sort((a, b) => a.order - b.order);

          // 서비스 데이터를 그룹화
          const serviceData = serviceResponse.data as AssistanceItem[];
          const groupedServices = sortedGroups.map((group) => ({
            ...group,
            services: serviceData.filter((service) => service.groupId === group.id),
          }));

          // 기타 서비스 처리
          const otherServices = serviceData.filter((service) => service.groupId === null);
          const extendedGroups = [
            ...groupedServices,
            { ...DEFAULT_ASSISTANCE_GROUP, services: otherServices },
          ];

          // 상태 업데이트
          setGroupList(extendedGroups);
          setServiceList(serviceData);
        } else {
          // 기본 그룹 리스트 처리
          setGroupList([DEFAULT_ASSISTANCE_GROUP]);
        }
      }
    );
  }, []);

  useEffect(() => {
    getGroupList();
  }, [getGroupList]);

  return (
    <>
      <Grid xs={6} sm={6} md={6} alignSelf="center" display="inner-flex">
        <Typography variant="subtitle1">서비스 목록</Typography>
        <Typography variant="body2">({serviceList.length})</Typography>
      </Grid>
      <Grid xs={6} sm={6} md={6} textAlign="end">
        <Button variant="soft" color="primary" onClick={onSuggestionOpen}>
          비서 서비스 제안
        </Button>
      </Grid>
      <Grid xs={12} sm={12} md={12}>
        <Card sx={{ px: 2, py: 1 }}>
          {groupList.length !== 0 && (
            <>
              <Tabs value={selectedTab} onChange={handleChange} color="primary">
                {groupList
                  .sort((a, b) => a.order - b.order)
                  .map((group, idx) => (
                    <Tab key={idx} label={group.name} />
                  ))}
              </Tabs>
              {/* 선택된 탭에 따른 서비스 리스트 */}
              <Box>
                {groupList[selectedTab].services.map((service, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    sx={{ margin: 1 }}
                    onClick={() => onOpenForm(service)}
                  >
                    {service.name}
                  </Button>
                ))}
              </Box>
            </>
          )}
        </Card>
      </Grid>
    </>
  );
}
