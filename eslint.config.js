// Delegate to CommonJS config to avoid ESM-only package imports here.
const mod = await import('./eslint.config.cjs');
export default (mod && (mod.default || mod));
