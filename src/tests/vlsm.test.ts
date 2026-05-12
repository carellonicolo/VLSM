import { describe, it, expect } from 'vitest';
import {
  parseIp,
  formatIp,
  prefixToMask,
  formatMask,
  hostsCount,
  minPrefixForHosts,
  networkAddress,
  broadcastAddress,
  firstHost,
  lastHost,
  allocateVlsm,
  findResidualBlocks,
  parseCidr,
  isAligned,
  blockContains,
} from '../lib/vlsm';

describe('parseIp / formatIp', () => {
  it('round-trip on common IPs', () => {
    for (const s of ['0.0.0.0', '10.0.0.1', '192.168.10.0', '172.16.4.0', '255.255.255.255']) {
      expect(formatIp(parseIp(s))).toBe(s);
    }
  });
  it('rejects invalid', () => {
    expect(() => parseIp('256.0.0.0')).toThrow();
    expect(() => parseIp('1.2.3')).toThrow();
    expect(() => parseIp('a.b.c.d')).toThrow();
  });
});

describe('prefixToMask / formatMask', () => {
  it('produces canonical masks', () => {
    expect(formatMask(0)).toBe('0.0.0.0');
    expect(formatMask(8)).toBe('255.0.0.0');
    expect(formatMask(16)).toBe('255.255.0.0');
    expect(formatMask(22)).toBe('255.255.252.0');
    expect(formatMask(24)).toBe('255.255.255.0');
    expect(formatMask(25)).toBe('255.255.255.128');
    expect(formatMask(26)).toBe('255.255.255.192');
    expect(formatMask(27)).toBe('255.255.255.224');
    expect(formatMask(28)).toBe('255.255.255.240');
    expect(formatMask(30)).toBe('255.255.255.252');
    expect(formatMask(32)).toBe('255.255.255.255');
  });
  it('handles all prefixes 0-32', () => {
    for (let p = 0; p <= 32; p++) {
      const mask = prefixToMask(p);
      expect(mask).toBeGreaterThanOrEqual(0);
      expect(mask).toBeLessThanOrEqual(0xffffffff);
    }
  });
});

describe('networkAddress (AND bitwise insidiosi)', () => {
  it('AND su 3° ottetto (verifica 1)', () => {
    const ip = parseIp('172.30.15.45');
    expect(formatIp(networkAddress(ip, 22))).toBe('172.30.12.0');
  });
  it('AND su 2° ottetto (verifica 4)', () => {
    const ip = parseIp('10.77.200.15');
    expect(formatIp(networkAddress(ip, 12))).toBe('10.64.0.0');
  });
  it('AND su 2° ottetto large (verifica 6)', () => {
    const ip = parseIp('172.33.200.50');
    expect(formatIp(networkAddress(ip, 11))).toBe('172.32.0.0');
  });
  it('AND 4° ottetto', () => {
    expect(formatIp(networkAddress(parseIp('10.0.0.130'), 25))).toBe('10.0.0.128');
    expect(formatIp(networkAddress(parseIp('192.168.1.200'), 27))).toBe('192.168.1.192');
  });
});

describe('hostsCount / minPrefixForHosts', () => {
  it('host counts known', () => {
    expect(hostsCount(24)).toBe(254);
    expect(hostsCount(26)).toBe(62);
    expect(hostsCount(30)).toBe(2);
    expect(hostsCount(15)).toBe(131070);
  });
  it('minPrefixForHosts', () => {
    expect(minPrefixForHosts(50)).toBe(26);
    expect(minPrefixForHosts(25)).toBe(27);
    expect(minPrefixForHosts(10)).toBe(28);
    expect(minPrefixForHosts(2)).toBe(30);
    expect(minPrefixForHosts(200)).toBe(24);
    expect(minPrefixForHosts(100)).toBe(25);
    expect(minPrefixForHosts(500)).toBe(23);
    expect(minPrefixForHosts(100000)).toBe(15);
  });
});

describe('firstHost / lastHost / broadcastAddress', () => {
  it('for 192.168.10.0/26', () => {
    const net = networkAddress(parseIp('192.168.10.0'), 26);
    expect(formatIp(firstHost(net, 26))).toBe('192.168.10.1');
    expect(formatIp(lastHost(net, 26))).toBe('192.168.10.62');
    expect(formatIp(broadcastAddress(net, 26))).toBe('192.168.10.63');
  });
  it('for 10.5.200.0/30', () => {
    const net = networkAddress(parseIp('10.5.200.1'), 30);
    expect(formatIp(net)).toBe('10.5.200.0');
    expect(formatIp(firstHost(net, 30))).toBe('10.5.200.1');
    expect(formatIp(lastHost(net, 30))).toBe('10.5.200.2');
    expect(formatIp(broadcastAddress(net, 30))).toBe('10.5.200.3');
  });
});

describe('allocateVlsm (golden test verifica 1, Es.1)', () => {
  it('192.168.10.0/24 con 50,25,10,2 host', () => {
    const parent = parseCidr('192.168.10.0/24');
    const out = allocateVlsm(parent, [
      { nome: 'LAN_A', host: 50 },
      { nome: 'LAN_B', host: 25 },
      { nome: 'LAN_C', host: 10 },
      { nome: 'WAN_1', host: 2 },
    ]);
    expect(out.map((b) => `${formatIp(b.net)}/${b.prefix}`)).toEqual([
      '192.168.10.0/26',
      '192.168.10.64/27',
      '192.168.10.96/28',
      '192.168.10.112/30',
    ]);
  });
  it('172.16.4.0/22 con 200,100,50,20,2,2 host (verifica 1, Es.2)', () => {
    const parent = parseCidr('172.16.4.0/22');
    const out = allocateVlsm(parent, [
      { nome: 'LAN_A', host: 200 },
      { nome: 'LAN_B', host: 100 },
      { nome: 'LAN_C', host: 50 },
      { nome: 'LAN_D', host: 20 },
      { nome: 'WAN_1', host: 2 },
      { nome: 'WAN_2', host: 2 },
    ]);
    expect(out.map((b) => `${formatIp(b.net)}/${b.prefix}`)).toEqual([
      '172.16.4.0/24',
      '172.16.5.0/25',
      '172.16.5.128/26',
      '172.16.5.192/27',
      '172.16.5.224/30',
      '172.16.5.228/30',
    ]);
  });
});

describe('findResidualBlocks (golden test verifica 1, Es.4)', () => {
  it('10.4.0.0/21 con 5 sottoreti A-E', () => {
    const parent = { net: parseIp('10.4.0.0'), prefix: 21 };
    const allocated = [
      { net: parseIp('10.4.0.0'), prefix: 24 },
      { net: parseIp('10.4.1.0'), prefix: 25 },
      { net: parseIp('10.4.1.128'), prefix: 26 },
      { net: parseIp('10.4.2.0'), prefix: 23 },
      { net: parseIp('10.4.4.0'), prefix: 24 },
    ];
    const out = findResidualBlocks(parent, allocated);
    expect(out.map((b) => `${formatIp(b.net)}/${b.prefix}`)).toEqual([
      '10.4.1.192/26',
      '10.4.5.0/24',
      '10.4.6.0/23',
    ]);
  });
});

describe('isAligned / blockContains', () => {
  it('isAligned', () => {
    expect(isAligned(parseIp('10.4.1.192'), 26)).toBe(true);
    expect(isAligned(parseIp('10.4.1.200'), 26)).toBe(false);
    expect(isAligned(parseIp('10.4.4.0'), 22)).toBe(true);
    expect(isAligned(parseIp('10.4.4.0'), 21)).toBe(false);
  });
  it('blockContains', () => {
    const outer = { net: parseIp('10.4.0.0'), prefix: 20 };
    expect(blockContains(outer, { net: parseIp('10.4.0.0'), prefix: 24 })).toBe(true);
    expect(blockContains(outer, { net: parseIp('10.4.15.0'), prefix: 24 })).toBe(true);
    expect(blockContains(outer, { net: parseIp('10.4.16.0'), prefix: 24 })).toBe(false);
  });
});
