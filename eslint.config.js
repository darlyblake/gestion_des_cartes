// Delegate to CommonJS config to avoid ESM-only package imports here.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./eslint.config.cjs');

export default config;

