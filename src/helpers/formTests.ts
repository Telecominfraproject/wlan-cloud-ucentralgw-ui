/* eslint-disable max-len */
import { isValidNumber, isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

export const testIpv4 = (ip?: string) => {
  const ipv4RegExp =
    /^(([0-9])|([1-9][0-9])|(1([0-9]{2}))|(2[0-4][0-9])|(25[0-5]))((\.(([0-9])|([1-9][0-9])|(1([0-9]{2}))|(2[0-4][0-9])|(25[0-5]))){3})(\/(([0-9])|([12][0-9])|(3[0-2])))?$/gi;
  if (ip) {
    return ipv4RegExp.test(ip);
  }

  return true;
};

export const testIpv6 = (ip?: string) => {
  const ipv6RegExp =
    /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/gi;
  if (ip) {
    return ipv6RegExp.test(ip);
  }

  return true;
};

export const testAlphanumWithDash = (str?: string) => {
  const alphanumWithDashRegExp = /^[a-zA-Z0-9-_]+$/;
  if (str !== undefined) {
    return str.length === 0 ? true : alphanumWithDashRegExp.test(str);
  }

  return true;
};

export const testFqdnHostname = (str?: string) => {
  const regex = /^(?!:\/\/)(?=.{1,255}$)((.{1,63}\.){1,127}(?![0-9]*$)[a-z0-9-]+\.?)$/;
  if (str !== undefined) {
    return str.length === 0 ? true : regex.test(str);
  }

  return false;
};

export const testLength = ({ val, min, max }: { val?: string; min: number; max: number }) => {
  if (val) {
    const { length } = val;
    if (min !== undefined && length < min) return false;
    if (max !== undefined && length > max) return false;
    return true;
  }

  return false;
};

export const testPemCertificate = (val?: string) => {
  if (val) {
    return val.includes('---BEGIN CERTIFICATE---') && val.includes('---END CERTIFICATE---');
  }

  return false;
};

export const testPemPrivateKey = (val?: string) => {
  if (val) {
    return val.includes('---BEGIN PRIVATE KEY---') && val.includes('---END PRIVATE KEY---');
  }

  return false;
};

export const testMac = (mac?: string) => {
  if (mac) {
    if (mac.length === 12) {
      if (mac.match('^[a-fA-F0-9]+$')) {
        return true;
      }
    }
  }
  return false;
};

export const testUcMac = (mac?: string) => {
  if (mac) {
    return mac.match('^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$');
  }
  return false;
};

export const testJson = (string: string) => {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
};

export const testInterfacesString = (str: string) => {
  let result = false;
  try {
    const res = JSON.parse(str);
    result = Object.keys(res)[0] === 'interfaces' && Array.isArray(res.interfaces);
  } catch (e) {
    result = false;
  }
  return result;
};

export const testRegex = (str?: string, regex?: string) => {
  if (str && regex) {
    return str.match(regex) !== null;
  }
  return true;
};

export const testPhoneNumberArray = (arr?: string[]) => {
  if (arr && arr.length > 0) {
    try {
      for (const phone of arr) {
        let testPhone = phone;
        if (phone.charAt(0) !== '+') testPhone = `+${testPhone}`;
        if (!isValidNumber(testPhone) || !isValidPhoneNumber(testPhone)) return false;
        const phoneNumber = parsePhoneNumber(testPhone);
        if (phoneNumber && !phoneNumber.isValid()) {
          return false;
        }
      }
    } catch {
      return false;
    }
  }

  return true;
};

const acceptedLeaseUnits = ['m', 'h', 'd'];
export const testLeaseTime = (str: string) => {
  let result = true;
  try {
    // @ts-ignore
    const arr: string[] = str.match(/\D+|\d+/g);
    if (arr && arr.length > 0 && arr.length <= 6 && arr.length % 2 === 0) {
      for (let i = 0; i < arr.length; i += 1) {
        if (i % 2 === 0) {
          const digit = arr[i] ?? '';
          if (digit.length === 0 || digit === '0') {
            result = false;
            break;
          }
        } else {
          const unit = arr[i] ?? '';
          if (!acceptedLeaseUnits.includes(unit)) {
            result = false;
            break;
          }
        }
      }
    } else result = false;
  } catch (e) {
    result = false;
  }
  return result;
};

export type TestSelectPortsProps = { ports: string[]; vlan?: number }[];

export const testSelectPorts = (obj: TestSelectPortsProps) => {
  const pairs = [];
  for (const { ports, vlan } of obj) {
    for (const port of ports) {
      if (port === 'WAN*') {
        pairs.push({ port: 'WAN1', vlan });
        pairs.push({ port: 'WAN2', vlan });
        pairs.push({ port: 'WAN3', vlan });
        pairs.push({ port: 'WAN4', vlan });
      } else if (port === 'LAN*') {
        pairs.push({ port: 'LAN1', vlan });
        pairs.push({ port: 'LAN2', vlan });
        pairs.push({ port: 'LAN3', vlan });
        pairs.push({ port: 'LAN4', vlan });
        pairs.push({ port: 'LAN5', vlan });
        pairs.push({ port: 'LAN6', vlan });
        pairs.push({ port: 'LAN7', vlan });
        pairs.push({ port: 'LAN8', vlan });
        pairs.push({ port: 'LAN9', vlan });
        pairs.push({ port: 'LAN10', vlan });
        pairs.push({ port: 'LAN11', vlan });
        pairs.push({ port: 'LAN12', vlan });
      } else pairs.push({ port, vlan });
    }
  }
  for (let i = 0; i < pairs.length; i += 1) {
    for (let y = i + 1; y < pairs.length; y += 1) {
      if (i !== y && pairs[i]?.port === pairs[y]?.port && pairs[i]?.vlan === pairs[y]?.vlan) return false;
    }
  }

  return true;
};

export const testObjectName = (str?: string) => (str ? str.length <= 30 : false);
