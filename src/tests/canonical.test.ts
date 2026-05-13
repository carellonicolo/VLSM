import { describe, it, expect } from 'vitest';
import { canonicalJson } from '../lib/pdfData';

describe('canonicalJson', () => {
  it('emits identical output regardless of key insertion order', () => {
    const a = { b: 1, a: 2, c: { y: 9, x: 8 } };
    const b = { c: { x: 8, y: 9 }, a: 2, b: 1 };
    expect(canonicalJson(a)).toBe(canonicalJson(b));
  });

  it('preserves array order (semantically significant)', () => {
    expect(canonicalJson([1, 2, 3])).toBe('[1,2,3]');
    expect(canonicalJson([3, 2, 1])).toBe('[3,2,1]');
  });

  it('handles primitives', () => {
    expect(canonicalJson(null)).toBe('null');
    expect(canonicalJson(42)).toBe('42');
    expect(canonicalJson('hello')).toBe('"hello"');
    expect(canonicalJson(true)).toBe('true');
  });

  it('handles nested arrays of objects with sorted keys', () => {
    const x = { items: [{ b: 1, a: 2 }, { d: 3, c: 4 }] };
    expect(canonicalJson(x)).toBe('{"items":[{"a":2,"b":1},{"c":4,"d":3}]}');
  });
});
