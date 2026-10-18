// Serveur pour les captures vidéo : sans rechargement à chaud (une page
// rechargée au milieu d'une capture fausserait les images).
import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config.js';

export default mergeConfig(base, defineConfig({ server: { hmr: false, watch: null } }));
