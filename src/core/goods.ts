import type { Good } from './types';

export const GOODS: Good[] = [
  { id: 'cocaine', name: 'Cocaine', unitOfMeasure: 'brick', standardDealSize: 10, baseValuePerUnit: 51, weight: 0.001, risk: 5, maxBulkUnits: 200 },
  { id: 'heroin', name: 'Heroin', unitOfMeasure: 'bundle', standardDealSize: 3, baseValuePerUnit: 34, weight: 0.05, risk: 4, maxBulkUnits: 60 },
  { id: 'hashish', name: 'Hashish', unitOfMeasure: 'bundle', standardDealSize: 1, baseValuePerUnit: 8, weight: 0.5, risk: 2, maxBulkUnits: 200 },
  { id: 'weed', name: 'Weed', unitOfMeasure: 'bundle', standardDealSize: 1, baseValuePerUnit: 7, weight: 0.5, risk: 1, maxBulkUnits: 200 },
  { id: 'meth', name: 'Methamphetamine', unitOfMeasure: 'gram', standardDealSize: 5, baseValuePerUnit: 20, weight: 0.001, risk: 4, maxBulkUnits: 100 },
  { id: 'ecstasy', name: 'Ecstasy', unitOfMeasure: 'pack', standardDealSize: 5, baseValuePerUnit: 9, weight: 0.01, risk: 3, maxBulkUnits: 80 },
];
