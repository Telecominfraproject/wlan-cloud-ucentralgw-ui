import { useReducer } from 'react';

const titles = {
  device_connection: 'Connected',
  device_disconnection: 'Disconnected',
  device_firmware_upgrade: 'Firmware Upgraded',
};
const bodies = {
  device_connection: 'This device has rebooted and is now connected!',
  device_disconnection: 'This device has started rebooting and is now disconnected!',
  device_firmware_upgrade: 'This device has updated to new firmware!',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'NEW_NOTIFICATION': {
      const obj = { type: 'NOTIFICATION', data: action.notification, timestamp: new Date() };
      return { ...state, lastMessage: obj };
    }
    case 'NEW_COMMAND': {
      const obj = {
        type: 'COMMAND',
        response: action.data.response,
        timestamp: new Date(),
        id: action.data.command_response_id,
      };
      return { ...state, lastMessage: obj };
    }
    case 'NEW_DEVICE_NOTIFICATION': {
      const newListeners = state.deviceListeners;
      let obj;

      if (action.subType === 'device_connection' || action.subType === 'device_disconnection') {
        obj = {
          type: 'DEVICE',
          isConnected: action.subType === 'device_connection',
          serialNumber: action.serialNumber,
          timestamp: new Date(),
        };
      }
      for (let i = 0; i < state.deviceListeners.length; i += 1) {
        if (
          state.deviceListeners[i].serialNumber === action.serialNumber &&
          state.deviceListeners[i].type === action.subType
        ) {
          if (state.deviceListeners[i].onTrigger) {
            setTimeout(() => state.deviceListeners[i].onTrigger(action.subType), 1000);
          } else if (state.deviceListeners[i].addToast) {
            state.deviceListeners[i].addToast(
              `${action.serialNumber} ${titles[state.deviceListeners[i].type]}`,
              bodies[state.deviceListeners[i].type],
            );
            const found = newListeners.findIndex(
              (listener) =>
                listener.serialNumber === action.serialNumber && listener.type === action.subType,
            );
            if (found >= 0) newListeners.splice(found, 1);
          }
        }
      }

      return { ...state, lastMessage: obj ?? state.lastMessage, deviceListeners: newListeners };
    }
    case 'ADD_DEVICE_LISTENER': {
      let newListeners = action.types.map((actionType) => ({
        type: actionType,
        serialNumber: action.serialNumber,
        addToast: action.addToast,
        onTrigger: action.onTrigger,
      }));
      newListeners = newListeners.concat(state.deviceListeners);
      return { ...state, lastMessage: state.lastMessage, deviceListeners: newListeners };
    }
    case 'REMOVE_DEVICE_LISTENER': {
      const newListeners = state.deviceListeners.filter(
        (listener) =>
          listener.serialNumber !== action.serialNumber || listener.onTrigger === undefined,
      );
      return { ...state, lastMessage: state.lastMessage, deviceListeners: newListeners };
    }
    case 'UNKNOWN': {
      const obj = { type: 'UNKNOWN', data: action.newMessage, timestamp: new Date() };
      return { ...state, lastMessage: obj };
    }
    default:
      throw new Error();
  }
};

const useSocketReducer = () => {
  const [{ lastMessage, deviceListeners }, dispatch] = useReducer(reducer, {
    deviceListeners: [],
  });

  return { lastMessage, deviceListeners, dispatch };
};

export default useSocketReducer;
