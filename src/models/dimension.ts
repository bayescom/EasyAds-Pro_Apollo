import { IRootDispatch, IRootState } from '@/store';
import dimensionService from '@/services/dimension';
import { CommonDimensionKey, IDimension, IDimensionOption, IDimensionOptionByDsp } from './types/dimension';

type OptionsPromise = Promise<IDimensionOption[]>;

type IState = {
  dimensions: IDimension[],
  dspOptions: Partial<Record<CommonDimensionKey, IDimensionOption[]>> & Record<string, IDimensionOptionByDsp[]>
  options: Partial<Record<CommonDimensionKey, IDimensionOption[]> & Record<string, IDimensionOption[]>>,
  pendingOptions: Partial<Record<CommonDimensionKey, OptionsPromise> & Record<string, OptionsPromise>>,
};

const defaultState: IState = {
  dimensions: [],
  options: {},
  dspOptions: {},
  pendingOptions: {},
};

export default {
  state: defaultState,

  reducers: {
    setDimensionList(prevState: IState, list: IDimension[]) {
      prevState.dimensions = list;
    },

    setDimensionOptionList(prevState: IState, { dimensionKey, list }: {
      dimensionKey: string,
      list: IDimensionOption[]
    }) {
      prevState.options[dimensionKey] = list;
    },

    setOptionsPromise(prevState: IState, { dimensionKey, optionsPromise }: {
      dimensionKey: string,
      optionsPromise: OptionsPromise
    }) {
      prevState.pendingOptions[dimensionKey] = optionsPromise;
    },
  },

  effects: (dispatch: IRootDispatch) => ({
    async getDimensionOptions(dimensionKey: string, state: IRootState) {
      if (state.dimension.pendingOptions[dimensionKey]) {
        return await state.dimension.pendingOptions[dimensionKey];
      }

      const promise = dimensionService.getDimensionOptions(dimensionKey);
      dispatch.dimension.setOptionsPromise({ dimensionKey, optionsPromise: promise });

      const data = await promise;
      const list: IDimensionOption[] = data['dimension-list'];
      dispatch.dimension.setDimensionOptionList({ list, dimensionKey });
      return list;
    },

    async getCommonDimensionOptions(dimensionKey: CommonDimensionKey) {
      return await dispatch.dimension.getDimensionOptions(dimensionKey);
    },
  }),
};
