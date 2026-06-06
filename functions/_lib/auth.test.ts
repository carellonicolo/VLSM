import { describe, it, expect } from 'vitest';
import {
  emailDomain,
  hashPassword,
  isValidSchoolEmail,
  normalizeEmail,
  normalizeName,
  signToken,
  verifyPassword,
  verifyToken,
  type AuthEnv,
} from './auth';

const env = { VLSM_AUTH_SECRET: 'test-secret-123' } as AuthEnv;
const env2 = { VLSM_AUTH_SECRET: 'altro-secret-999' } as AuthEnv;

describe('password hashing (PBKDF2)', () => {
  it('verifica la password corretta e rifiuta quella sbagliata', async () => {
    const hash = await hashPassword('SuperSegreta1');
    expect(hash.startsWith('pbkdf2$')).toBe(true);
    expect(await verifyPassword('SuperSegreta1', hash)).toBe(true);
    expect(await verifyPassword('sbagliata', hash)).toBe(false);
  });

  it('genera hash diversi (salt casuale) per la stessa password', async () => {
    const a = await hashPassword('uguale');
    const b = await hashPassword('uguale');
    expect(a).not.toBe(b);
    expect(await verifyPassword('uguale', a)).toBe(true);
    expect(await verifyPassword('uguale', b)).toBe(true);
  });

  it('rifiuta hash malformati senza eccezioni', async () => {
    expect(await verifyPassword('x', 'non-un-hash')).toBe(false);
    expect(await verifyPassword('x', '')).toBe(false);
  });
});

describe('token di sessione (HMAC)', () => {
  it('firma e verifica un token valido', async () => {
    const token = await signToken(env, 'stud-abc');
    const claims = await verifyToken(env, token);
    expect(claims?.sid).toBe('stud-abc');
    expect(typeof claims?.exp).toBe('number');
  });

  it('rifiuta un token firmato con un altro secret', async () => {
    const token = await signToken(env2, 'stud-abc');
    expect(await verifyToken(env, token)).toBeNull();
  });

  it('rifiuta un token manomesso', async () => {
    const token = await signToken(env, 'stud-abc');
    const tampered = token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa');
    expect(await verifyToken(env, tampered)).toBeNull();
  });

  it('rifiuta input non-token', async () => {
    expect(await verifyToken(env, '')).toBeNull();
    expect(await verifyToken(env, 'senza-punto')).toBeNull();
  });
});

describe('validazione email scolastica', () => {
  it('default domain è marconiverona.edu.it', () => {
    expect(emailDomain({} as AuthEnv)).toBe('marconiverona.edu.it');
  });

  it('accetta email del dominio della scuola, rifiuta le altre', () => {
    expect(isValidSchoolEmail('mario.rossi@marconiverona.edu.it', env)).toBe(true);
    expect(isValidSchoolEmail('MARIO@MARCONIVERONA.EDU.IT', env)).toBe(true);
    expect(isValidSchoolEmail('mario.rossi@gmail.com', env)).toBe(false);
    expect(isValidSchoolEmail('mario.rossi@marconiverona.edu.it.evil.com', env)).toBe(false);
    expect(isValidSchoolEmail('non-una-email', env)).toBe(false);
  });

  it('normalizza email e nomi', () => {
    expect(normalizeEmail('  Mario.Rossi@Scuola.IT ')).toBe('mario.rossi@scuola.it');
    expect(normalizeName('  Mario   Rossi  ')).toBe('Mario Rossi');
  });
});
