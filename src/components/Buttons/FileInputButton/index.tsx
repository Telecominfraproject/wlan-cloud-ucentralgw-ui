import React, { useEffect, useState } from 'react';
import { FormControl, Input, InputGroup } from '@chakra-ui/react';
import { v4 as uuid } from 'uuid';

export interface FileInputButtonProps {
  value: string;
  setValue: (v: string, file?: File) => void;
  setFileName?: (v: string) => void;
  refreshId: string;
  accept: string;
  isHidden?: boolean;
  isStringFile?: boolean;
  sizeLimit?: number;
}

const _FileInputButton: React.FC<FileInputButtonProps> = ({
  value,
  setValue,
  setFileName,
  refreshId,
  accept,
  isHidden,
  isStringFile,
  sizeLimit,
}) => {
  const [fileKey, setFileKey] = useState(uuid());
  let fileReader: FileReader | undefined;

  const handleStringFileRead = () => {
    if (fileReader) {
      const content = fileReader.result;
      if (content) {
        setValue(content as string);
      }
    }
  };

  const changeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    if (file) {
      if (sizeLimit && file.size > sizeLimit) {
        setFileKey(uuid());
      } else {
        const newVal = URL.createObjectURL(file);
        if (!isStringFile) {
          setValue(newVal, file);
          if (setFileName) setFileName(file.name ?? '');
        } else {
          fileReader = new FileReader();
          if (setFileName) setFileName(file.name);
          fileReader.onloadend = handleStringFileRead;
          fileReader.readAsText(file);
        }
      }
    }
  };

  useEffect(() => {
    if (value === '') setFileKey(uuid());
  }, [refreshId, value]);

  return (
    <FormControl hidden={isHidden}>
      <InputGroup>
        <Input
          borderRadius="15px"
          pt={1}
          fontSize="sm"
          type="file"
          onChange={changeFile}
          key={fileKey}
          accept={accept}
        />
      </InputGroup>
    </FormControl>
  );
};

export const FileInputButton = React.memo(_FileInputButton);
