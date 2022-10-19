import * as React from 'react';
import { Avatar, Box, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { DeleteButton } from 'components/Buttons/DeleteButton';
import { FileInputButton } from 'components/Buttons/FileInputButton';
import { SaveButton } from 'components/Buttons/SaveButton';
import { Modal } from 'components/Modals/Modal';
import { useAuth } from 'contexts/AuthProvider';
import { useDeleteAvatar, useUpdateAvatar } from 'hooks/Network/Account';
import { User } from 'models/User';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
};

const AvatarModal = ({ isOpen, onClose, user }: Props) => {
  const { t } = useTranslation();
  const { avatar, refetchUser } = useAuth();
  const [key, setKey] = React.useState(uuid());
  const deleteAvatar = useDeleteAvatar({ user, refetch: refetchUser });
  const updateAvatar = useUpdateAvatar({ user, refetch: refetchUser });
  const [currentAvatar, setCurrentAvatar] = React.useState<{
    link: string;
    file?: File;
  }>({
    link: avatar ?? '',
    file: undefined,
  });

  const updateCurrentAvatar = (uri: string, file: File | undefined) => {
    setCurrentAvatar({
      link: uri,
      file,
    });
  };

  const resetAvatar = () => {
    setCurrentAvatar({
      link: '',
    });
  };

  const onSave = async () => {
    if (currentAvatar.link === '' && avatar !== '')
      deleteAvatar.mutateAsync(undefined, {
        onSuccess: () => {
          onClose();
        },
      });
    else if (currentAvatar.file !== undefined)
      updateAvatar.mutateAsync(currentAvatar.file, {
        onSuccess: () => {
          onClose();
        },
      });
  };

  React.useEffect(() => {
    if (isOpen) {
      setCurrentAvatar({
        link: avatar ?? '',
      });
      setKey(uuid());
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('profile.manage_avatar')}
      options={{ modalSize: 'sm' }}
      topRightButtons={
        <SaveButton
          onClick={onSave}
          isCompact
          isDisabled={currentAvatar.link === avatar}
          isLoading={deleteAvatar.isLoading || updateAvatar.isLoading}
        />
      }
    >
      <Box my={12} mb="0px">
        <Center>
          <Avatar size="2xl" name={user?.name} src={currentAvatar.link} />
        </Center>
        <Box display="flex" mt={4}>
          <FileInputButton value={currentAvatar.link} setValue={updateCurrentAvatar} refreshId={key} accept="image/*" />
          <DeleteButton isCompact onClick={resetAvatar} ml={2} isDisabled={currentAvatar.link === ''} />
        </Box>
      </Box>
    </Modal>
  );
};

export default AvatarModal;
