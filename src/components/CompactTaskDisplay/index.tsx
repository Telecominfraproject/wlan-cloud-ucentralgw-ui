import * as React from 'react';
import { Badge, HStack, Stat, StatHelpText, StatLabel, StatNumber } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import FormattedDate from 'components/InformationDisplays/FormattedDate';

const test = new Date().getTime() / 1000;

type Props = {
  date?: number;
  venue?: string;
  type?: string;
  hideStatus?: boolean;
};
const CompactTaskDisplay = ({ date, venue, type, hideStatus }: Props) => {
  const { t } = useTranslation();

  return (
    <HStack spacing={2}>
      {!hideStatus && <Badge colorScheme="green">{t('common.success')}</Badge>}
      <Stat>
        <StatLabel>
          <FormattedDate date={date ?? test} />
        </StatLabel>
        <StatNumber fontSize="xl">{type ?? 'Installation'}</StatNumber>
        <StatHelpText>{venue ?? 'Ally Detroit Center'}</StatHelpText>
      </Stat>
    </HStack>
  );
};

export default CompactTaskDisplay;
