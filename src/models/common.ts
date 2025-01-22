import { PageParams } from './types/common';

const defaultTableParams: PageParams = {
  page: 1,
  limit: 20,
};

const firstLetterToOperatorMap = {
  '>': '>=',
  '<': '<=',
  '!': '!'
} as const;

const firstLetterToPropertyMap = {
  '>': '>=',
  '<': '<=',
  '!': 'exclude',
  '': 'include'
} as const;

export { defaultTableParams, firstLetterToOperatorMap, firstLetterToPropertyMap };
