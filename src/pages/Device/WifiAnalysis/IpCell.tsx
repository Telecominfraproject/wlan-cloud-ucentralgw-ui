import * as React from 'react';
import { CopyIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  Heading,
  IconButton,
  ListItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  Tooltip,
  UnorderedList,
  useBoolean,
  useClipboard,
} from '@chakra-ui/react';

const CopyString = ({ str }: { str: string }) => {
  const [isHovered, setHovered] = useBoolean(false);
  const copy = useClipboard(str);

  return (
    <Flex alignItems="center" onMouseEnter={setHovered.on} onMouseLeave={setHovered.off}>
      <Text>{str}</Text>
      <Tooltip label={copy.hasCopied ? 'Copied!' : 'Copy'} placement="top">
        <IconButton
          aria-label={copy.hasCopied ? 'Copied!' : 'Copy'}
          size="sm"
          onClick={copy.onCopy}
          icon={<CopyIcon />}
          variant="transparent"
          opacity={!isHovered ? 0 : 1}
        />
      </Tooltip>
    </Flex>
  );
};

type Props = {
  ipv4: string[];
  ipv6: string[];
};

const IpCell = ({ ipv4, ipv6 }: Props) => {
  const length = ipv4.length + ipv6.length;

  return (
    <Popover>
      <PopoverTrigger>
        <Button colorScheme="teal" size="sm">
          {length}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Heading size="sm">
            {length} {length === 1 ? 'IP' : 'IPs'}
          </Heading>
        </PopoverHeader>
        <PopoverBody>
          <Heading size="sm">IpV4 ({ipv4.length})</Heading>
          <UnorderedList>
            {ipv4.map((ip) => (
              <ListItem key={ip}>
                <CopyString str={ip} />
              </ListItem>
            ))}
          </UnorderedList>
          <Heading size="sm">IpV6 ({ipv6.length})</Heading>
          <UnorderedList>
            {ipv6.map((ip) => (
              <ListItem key={ip}>
                <CopyString str={ip} />
              </ListItem>
            ))}
          </UnorderedList>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default IpCell;
