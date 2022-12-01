import * as React from 'react';
import { VStack } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import ScriptTableCard from './TableCard';
import ViewScriptCard from './ViewScriptCard';
import { useGetAllDeviceScripts } from 'hooks/Network/Scripts';

const ScriptsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const getScripts = useGetAllDeviceScripts();
  const isScriptSelected = !!id && id !== '0';

  const onIdSelect = React.useCallback(
    (newId: string) => {
      if (newId !== id) {
        navigate(`/scripts/${newId}`);
      }
    },
    [id],
  );

  const idToUse = isScriptSelected ? id : getScripts.data?.[0]?.id;

  return (
    <VStack spacing={4}>
      <ScriptTableCard onIdSelect={onIdSelect} />
      {idToUse !== undefined ? <ViewScriptCard id={idToUse} onIdSelect={onIdSelect} /> : null}
    </VStack>
  );
};

export default ScriptsPage;
