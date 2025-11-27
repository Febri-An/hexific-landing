import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Hexific Audit',
  projectId: '6bd2c70ca921990767095c8f2db0cdcf',
  chains: [baseSepolia],
  ssr: true,
});