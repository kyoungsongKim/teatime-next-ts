import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { Iconify } from 'src/components/iconify';

import type { FaqsItem } from '../../types/faqs';

// ----------------------------------------------------------------------

interface FaqsListProps {
  faqs: FaqsItem[];
}

export function FaqsList({ faqs = [] }: FaqsListProps) {
  return (
    <Box>
      {faqs.map((accordion) => (
        <Accordion key={accordion.id}>
          <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
            <Typography variant="subtitle1">{accordion.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              component="div"
              dangerouslySetInnerHTML={{ __html: accordion.description.replace(/\n/g, '<br />') }}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
