/**
 * IPv6 Utilities Test Suite
 */

import {
  isValidIPv6,
  isValidPrefix,
  expandIPv6,
  compressIPv6,
  ipv6ToBinary,
  calculateIPv6Subnet,
  getIPv6AddressType,
  getIPv6Scope,
} from '../lib/ipv6';

describe('IPv6 Validation', () => {
  test('validates correct IPv6 addresses', () => {
    expect(isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
    expect(isValidIPv6('2001:db8:85a3::8a2e:370:7334')).toBe(true);
    expect(isValidIPv6('::1')).toBe(true);
    expect(isValidIPv6('::')).toBe(true);
    expect(isValidIPv6('fe80::1')).toBe(true);
    expect(isValidIPv6('::ffff:192.168.1.1')).toBe(true);
  });

  test('rejects invalid IPv6 addresses', () => {
    expect(isValidIPv6('gggg::1')).toBe(false);
    expect(isValidIPv6('2001:db8:::1')).toBe(false);
    expect(isValidIPv6('2001:db8:85a3:0000:0000:8a2e:0370:7334:extra')).toBe(false);
    expect(isValidIPv6('192.168.1.1')).toBe(false);
  });

  test('validates prefix lengths', () => {
    expect(isValidPrefix(0)).toBe(true);
    expect(isValidPrefix(64)).toBe(true);
    expect(isValidPrefix(128)).toBe(true);
    expect(isValidPrefix(-1)).toBe(false);
    expect(isValidPrefix(129)).toBe(false);
    expect(isValidPrefix(64.5)).toBe(false);
  });
});

describe('IPv6 Expansion and Compression', () => {
  test('expands compressed IPv6 addresses', () => {
    expect(expandIPv6('2001:db8::1')).toBe('2001:0db8:0000:0000:0000:0000:0000:0001');
    expect(expandIPv6('::1')).toBe('0000:0000:0000:0000:0000:0000:0000:0001');
    expect(expandIPv6('::')).toBe('0000:0000:0000:0000:0000:0000:0000:0000');
    expect(expandIPv6('fe80::1')).toBe('fe80:0000:0000:0000:0000:0000:0000:0001');
  });

  test('compresses IPv6 addresses', () => {
    expect(compressIPv6('2001:0db8:0000:0000:0000:0000:0000:0001')).toBe('2001:db8::1');
    expect(compressIPv6('0000:0000:0000:0000:0000:0000:0000:0001')).toBe('::1');
    expect(compressIPv6('0000:0000:0000:0000:0000:0000:0000:0000')).toBe('::');
    expect(compressIPv6('fe80:0000:0000:0000:0000:0000:0000:0001')).toBe('fe80::1');
  });

  test('handles addresses that are already in correct format', () => {
    const addr = '2001:db8::1';
    expect(compressIPv6(expandIPv6(addr))).toBe(addr);
  });
});

describe('IPv6 Binary Conversion', () => {
  test('converts IPv6 to binary', () => {
    const binary = ipv6ToBinary('::1');
    expect(binary.split(':').length).toBe(8);
    expect(binary.endsWith('0000000000000001')).toBe(true);
  });

  test('binary representation has correct length', () => {
    const binary = ipv6ToBinary('2001:db8::1');
    const bitsOnly = binary.replace(/:/g, '');
    expect(bitsOnly.length).toBe(128);
  });
});

describe('IPv6 Address Types', () => {
  test('identifies loopback address', () => {
    expect(getIPv6AddressType('::1')).toBe('Loopback (::1)');
  });

  test('identifies unspecified address', () => {
    expect(getIPv6AddressType('::')).toBe('Unspecified (::)');
  });

  test('identifies link-local addresses', () => {
    expect(getIPv6AddressType('fe80::1')).toBe('Link-Local Unicast');
    expect(getIPv6AddressType('fe80::1234:5678:90ab:cdef')).toBe('Link-Local Unicast');
  });

  test('identifies global unicast addresses', () => {
    expect(getIPv6AddressType('2001:db8::1')).toBe('Global Unicast');
    expect(getIPv6AddressType('2001:0db8:85a3::8a2e:370:7334')).toBe('Global Unicast');
  });

  test('identifies unique local addresses', () => {
    expect(getIPv6AddressType('fc00::1')).toBe('Unique Local Unicast (ULA)');
    expect(getIPv6AddressType('fd00::1')).toBe('Unique Local Unicast (ULA)');
  });

  test('identifies multicast addresses', () => {
    expect(getIPv6AddressType('ff02::1')).toBe('Multicast');
  });
});

describe('IPv6 Scope', () => {
  test('determines correct scope', () => {
    expect(getIPv6Scope('::1')).toBe('Node-Local');
    expect(getIPv6Scope('fe80::1')).toBe('Link-Local');
    expect(getIPv6Scope('2001:db8::1')).toBe('Global');
    expect(getIPv6Scope('fc00::1')).toBe('Organization-Local');
  });
});

describe('IPv6 Subnet Calculation', () => {
  test('calculates subnet for valid inputs', () => {
    const result = calculateIPv6Subnet('2001:db8::1', 64);
    expect(result).not.toBeNull();
    expect(result?.prefix).toBe(64);
    expect(result?.addressType).toBe('Global Unicast');
  });

  test('returns null for invalid inputs', () => {
    expect(calculateIPv6Subnet('invalid', 64)).toBeNull();
    expect(calculateIPv6Subnet('2001:db8::1', 200)).toBeNull();
  });

  test('calculates correct network address', () => {
    const result = calculateIPv6Subnet('2001:db8:1234:5678::1', 64);
    expect(result?.networkAddressCompressed).toBe('2001:db8:1234:5678::');
  });

  test('handles /128 prefix (single host)', () => {
    const result = calculateIPv6Subnet('2001:db8::1', 128);
    expect(result).not.toBeNull();
    expect(result?.totalAddresses).toBe('1');
  });

  test('handles ::/0 (entire IPv6 space)', () => {
    const result = calculateIPv6Subnet('::', 0);
    expect(result).not.toBeNull();
    expect(result?.prefix).toBe(0);
  });
});

describe('IPv6 Real-world Examples', () => {
  test('processes common ISP allocation (/32)', () => {
    const result = calculateIPv6Subnet('2001:db8::', 32);
    expect(result).not.toBeNull();
    expect(result?.prefix).toBe(32);
  });

  test('processes common organization allocation (/48)', () => {
    const result = calculateIPv6Subnet('2001:db8:1234::', 48);
    expect(result).not.toBeNull();
    expect(result?.prefix).toBe(48);
  });

  test('processes standard LAN subnet (/64)', () => {
    const result = calculateIPv6Subnet('2001:db8:1234:5678::', 64);
    expect(result).not.toBeNull();
    expect(result?.prefix).toBe(64);
    expect(result?.networkAddressCompressed).toBe('2001:db8:1234:5678::');
  });

  test('processes link-local address', () => {
    const result = calculateIPv6Subnet('fe80::1', 64);
    expect(result).not.toBeNull();
    expect(result?.addressType).toBe('Link-Local Unicast');
    expect(result?.scope).toBe('Link-Local');
  });
});
