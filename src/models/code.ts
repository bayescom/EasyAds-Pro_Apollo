import codeService from '@/services/code';
import { IRootDispatch, IRootState } from '@/store';
import { Code, CodeType } from './types/code';

type IState = Partial<Record<CodeType, Code[]>> & {
  _promise: Partial<Record<CodeType, Promise<Code[]>>>,
};

export default {
  state: {
    _promise: {}
  } as IState,

  reducers: {
    updateCodeList(prevState: IState, { type, list }) {
      prevState[type] = list;
    },

    updateCodePromise(prevState: IState, { type, promise }: { type: CodeType, promise: Promise<Code[]> }) {
      prevState._promise[type] = promise;
    }
  },

  effects: (dispatch: IRootDispatch) => ({
    async fetchCodeList([type, numberValue = false]: [CodeType, boolean?], state: IRootState) {
      if (state.code[type]) {
        return state.code[type] as Code[];
      }

      if (state.code._promise[type]) {
        return await state.code._promise[type];
      }

      const promise = codeService.getList(type);
      dispatch.code.updateCodePromise({ type, promise });

      const data = await promise;
      const codeList = data['code-list'].map(item => ({
        ...item,
        name: item.name,
        value: numberValue ? +item.value : item.value,
      }));
      dispatch.code.updateCodeList({ type, list: codeList });
      return codeList;
    }
  }),
};
