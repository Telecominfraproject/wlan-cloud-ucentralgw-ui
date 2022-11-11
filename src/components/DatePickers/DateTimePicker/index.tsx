import React from 'react';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import 'react-datepicker/dist/react-datepicker.css';
import DatePickerInput from '../DatePickerInput';

type Props = {
  date: Date;
  onChange: (v: Date | null) => void;
  isStart?: boolean;
  isEnd?: boolean;
  startDate?: Date;
  endDate?: Date;
  isDisabled?: boolean;
};

const DateTimePicker = ({ date, onChange, isStart, isEnd, startDate, endDate, isDisabled }: Props) => {
  const { t } = useTranslation();

  return (
    <DatePicker
      selected={date}
      onChange={onChange}
      selectsStart={isStart}
      selectsEnd={isEnd}
      startDate={startDate}
      endDate={endDate}
      timeInputLabel={`${t('common.time')}: `}
      dateFormat="dd/MM/yyyy hh:mm aa"
      timeFormat="p"
      showTimeSelect
      customInput={<DatePickerInput isDisabled={isDisabled} />}
    />
  );
};

export default React.memo(DateTimePicker);
