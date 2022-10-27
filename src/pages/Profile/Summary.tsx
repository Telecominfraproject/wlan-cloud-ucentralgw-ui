import * as React from 'react';
import { Avatar, AvatarBadge, Box, Center, Heading, Text, useDisclosure } from '@chakra-ui/react';
import { Pen } from 'phosphor-react';
import AvatarModal from './AvatarModal';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { useAuth } from 'contexts/AuthProvider';
import { uppercaseFirstLetter } from 'helpers/stringHelper';

const SummaryInformationProfile = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, avatar } = useAuth();

  return (
    <Card p={4}>
      <CardBody display="block">
        <Box
          h="120px"
          bg="linear-gradient(135deg, var(--chakra-colors-pink-500) 0%, var(--chakra-colors-red-500) 50%, var(--chakra-colors-purple-500) 100%)"
          borderRadius="15px"
          mb={8}
        />
        <Center mt="-84px" mb="0px">
          <Avatar size="xl" name={user?.name} src={avatar} onClick={onOpen} _hover={{ cursor: 'pointer ' }}>
            <AvatarBadge boxSize="0.65em" bg="gray.100" borderWidth={0} top="15px" right="2px" placement="top-end">
              <Pen size={18} />
            </AvatarBadge>
          </Avatar>
        </Center>
        <Center>
          <Heading size="lg">{user?.name}</Heading>
        </Center>
        <Center>
          <Text>{uppercaseFirstLetter(user?.userRole)}</Text>
        </Center>
        {user && <AvatarModal isOpen={isOpen} onClose={onClose} user={user} />}
      </CardBody>
    </Card>
  );
};

export default SummaryInformationProfile;
