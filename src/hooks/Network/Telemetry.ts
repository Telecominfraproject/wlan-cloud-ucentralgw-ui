import React, { useRef, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { axiosGw } from 'constants/axiosInstances';
import { useAuth } from 'contexts/AuthProvider';

export type TelemetryResponse = {
  action: string;
  serialNumber: string;
  status: {
    interval: number;
    kafkaClients: number;
    kafkaPackets: number;
    kafkaTimer: number;
    running: boolean;
    websocketClients: number;
    websocketPackets: number;
    websocketTimer: number;
  };
  uri: string;
  uuid: string;
};

export type TelemetryRequest = {
  serialNumber: string;
  interval: number;
  lifetime: number;
  kafka: boolean;
  types: string[];
};

const startTelemetryRequest = async (request: TelemetryRequest) =>
  axiosGw.post<TelemetryResponse>(`device/${request.serialNumber}/telemetry`, request);

export const useStartTelemetry = () => useMutation(startTelemetryRequest);

export const useTelemetry = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const start = useStartTelemetry();
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ws = useRef<WebSocket | undefined>(undefined);
  const [lastMessage, setLastMessage] = useState<{ msg: unknown; timestamp: Date } | undefined>();

  const closeSocket = () => {
    if (ws !== undefined) {
      ws?.current?.close();
      setLastMessage(undefined);
      start.reset();
    }
  };

  const onStartWebSocket = (uri: string) => {
    ws.current = new WebSocket(uri);
    ws.current.onopen = () => {
      setIsOpen(true);
      ws.current?.send(`token:${token}`);
    };
    ws.current.onclose = () => {
      setIsOpen(false);
    };
  };

  const startTelemetry = async (request: TelemetryRequest, onClose?: () => void) => {
    start.mutate(request, {
      onSuccess: (response) => {
        if (request.kafka) {
          toast({
            id: 'telemetry-device-success',
            title: t('common.success'),
            description: t('controller.telemetry.kafka_success'),
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
          if (onClose) onClose();
        } else {
          onStartWebSocket(response.data.uri);
        }
      },
    });
  };

  const onMessage = (str: MessageEvent<string>) => {
    try {
      setLastMessage({ msg: JSON.parse(str.data), timestamp: new Date() });
    } catch (e) {
      setLastMessage({
        msg: {
          error: 'Error Parsing Data',
        },
        timestamp: new Date(),
      });
    }
  };

  React.useEffect(() => {
    if (ws?.current) {
      ws.current.addEventListener('message', onMessage);
    }

    const wsCurrent = ws?.current;
    return () => {
      if (wsCurrent) {
        wsCurrent.removeEventListener('message', onMessage);
        wsCurrent.close();
      }
    };
  }, [ws?.current]);

  return {
    startTelemetry,
    closeSocket,
    lastMessage,
    isOpen,
    startRequest: start,
  };
};
