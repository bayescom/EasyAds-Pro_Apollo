export const normalizePlatformOptions = (
  list: Array<{ name: string; value: string | number }>
): ISdkCustomerChannelPlatformOption[] => {
  return list.map(item => ({
    osType: Number(item.value),
    name: item.name,
  }));
};

export const createDefaultPlatformConfig = (): ISdkCustomerChannelPlatformConfig => ({
  enabled: false,
  module_name: '',
  initClassName: '',
  adapters: [],
});

export const createEnabledPlatformConfig = (): ISdkCustomerChannelPlatformConfig => ({
  enabled: true,
  module_name: '',
  initClassName: '',
  adapters: [],
});

export const createDefaultFormValues = (
  platformOptions: ISdkCustomerChannelPlatformOption[]
): ISdkCustomerChannelFormValues => {
  const platforms: Record<number, ISdkCustomerChannelPlatformConfig> = {};
  platformOptions.forEach(({ osType }) => {
    platforms[osType] = createDefaultPlatformConfig();
  });

  return {
    name: '',
    icon: undefined,
    platforms,
  };
};

export const getEnabledPlatformLabels = (
  platforms: ISdkCustomerChannel['platforms'],
  platformOptions: ISdkCustomerChannelPlatformOption[]
): string => {
  const platformLabelMap = Object.fromEntries(
    platformOptions.map(item => [item.osType, item.name])
  );

  const labels = platformOptions
    .filter(({ osType }) => platforms[osType]?.enabled)
    .map(({ osType }) => platformLabelMap[osType]);

  return labels.length ? labels.join(', ') : '-';
};

export const normalizePlatforms = (
  platforms: Record<number, ISdkCustomerChannelPlatformConfig>
): ISdkCustomerChannel['platforms'] => {
  const result: ISdkCustomerChannel['platforms'] = {};

  Object.entries(platforms).forEach(([osType, platform]) => {
    if (!platform) {
      return;
    }

    result[Number(osType)] = {
      osConfigId: platform.osConfigId,
      enabled: !!platform.enabled,
      module_name: platform.module_name,
      initClassName: platform.initClassName,
      adapters: platform.adapters || [],
    };
  });

  return result;
};

export const toFormValues = (
  item: ISdkCustomerChannel | undefined,
  platformOptions: ISdkCustomerChannelPlatformOption[]
): ISdkCustomerChannelFormValues => {
  if (!item) {
    return createDefaultFormValues(platformOptions);
  }

  const platforms = createDefaultFormValues(platformOptions).platforms;
  platformOptions.forEach(({ osType }) => {
    const platformConfig = item.platforms[osType];
    if (platformConfig) {
      platforms[osType] = { ...platformConfig };
    }
  });

  return {
    name: item.name,
    icon: item.icon,
    platforms,
  };
};

export const toSdkCustomerChannel = (
  values: ISdkCustomerChannelFormValues,
  current?: Pick<ISdkCustomerChannel, 'id'>
): ISdkCustomerChannel => {
  const iconValue = Array.isArray(values.icon) ? values.icon[0] : values.icon;

  return {
    id: current?.id || 0,
    name: values.name,
    icon: iconValue || 'http://blink.bayescom.com/img/sdk/default.png',
    platforms: normalizePlatforms(values.platforms),
  };
};

export const normalizeAdapterOptions = (
  data?: { 'code-list'?: Array<{ value: string; name: string }> } | null
): { value: string; label: string }[] => {
  const rawList = data?.['code-list'] || [];

  return rawList
    .map(item => ({
      value: String(item.value ?? ''),
      label: String(item.name ?? ''),
    }))
    .filter(item => item.value && item.label && item.value !== 'init');
};
