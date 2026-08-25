import { createDefaultFormValues } from './index';

function formatConfigFromPlatform(platform: ISdkCustomerChannelPlatformConfig) {
  const config: Record<string, string> = {};

  if (platform.module_name) {
    config.module_name = platform.module_name;
  }

  if (platform.initClassName) {
    config.init = platform.initClassName;
  }

  if (platform.adapters && platform.adapters.length) {
    platform.adapters.forEach(adapter => {
      if (adapter.type && adapter.className) {
        config[adapter.type] = adapter.className;
      }
    });
  }

  return config;
}

function hasConfigContent(config: Record<string, string>) {
  return Object.keys(config).some(key => Boolean(config[key]));
}

function parseConfigFromPayload(
  config: string | Record<string, string> | null | undefined
): Record<string, string> {
  if (!config) {
    return {};
  }

  if (typeof config === 'string') {
    try {
      const parsed = JSON.parse(config);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  return config;
}

function formatAdapterItemsFromConfig(config: Record<string, string>) {
  const adapters: ISdkCustomerChannelAdapterItem[] = [];

  if (!config) {
    return adapters;
  }

  Object.keys(config).forEach(type => {
    const className = config[type];
    if (!className || type === 'init' || type === 'module_name') {
      return;
    }
    adapters.push({
      type,
      className,
    });
  });

  return adapters;
}

function formatOsConfigPayload(
  osType: number,
  platform: ISdkCustomerChannelPlatformConfig | undefined,
  channelId: number
): ISdkCustomerChannelOsConfig {
  const osConfigId = platform?.osConfigId;
  const base = {
    ...(osConfigId ? { id: osConfigId } : {}),
    ...(channelId ? { sdkCustomerChannelId: channelId } : {}),
    osType,
  };

  if (!platform?.enabled) {
    const config = platform ? formatConfigFromPlatform(platform) : {};
    return {
      ...base,
      status: 0,
      config: hasConfigContent(config) ? JSON.stringify(config) : '',
    };
  }

  return {
    ...base,
    status: 1,
    config: JSON.stringify(formatConfigFromPlatform(platform)),
  };
}

export function formatPayloadDataFromModal(
  sdkCustomerChannelFormData: ISdkCustomerChannel,
  platformOptions: ISdkCustomerChannelPlatformOption[]
) {
  const platforms = sdkCustomerChannelFormData.platforms || {};
  const channelId = sdkCustomerChannelFormData.id || 0;

  const osConfigs: ISdkCustomerChannelOsConfig[] = platformOptions.map(({ osType }) =>
    formatOsConfigPayload(osType, platforms[osType], channelId)
  );

  const sdkCustomerChannel = {
    name: sdkCustomerChannelFormData.name,
    osConfigs,
  } as Omit<ISdkCustomerChannelApiItem, 'id'>;

  if (sdkCustomerChannelFormData.icon) {
    sdkCustomerChannel.icon = sdkCustomerChannelFormData.icon;
  }

  return sdkCustomerChannel;
}

export function formatModalDataFromPayload(
  sdkCustomerChannelPayloadData: ISdkCustomerChannelApiItem,
  platformOptions: ISdkCustomerChannelPlatformOption[]
) {
  const platforms = createDefaultFormValues(platformOptions).platforms;
  const osConfigs = sdkCustomerChannelPayloadData.osConfigs || [];

  osConfigs.forEach(osConfig => {
    if (!osConfig) {
      return;
    }

    const config = parseConfigFromPayload(osConfig.config);
    platforms[osConfig.osType] = {
      osConfigId: osConfig.id,
      enabled: !!osConfig.status,
      module_name: config.module_name || '',
      initClassName: config.init || '',
      adapters: formatAdapterItemsFromConfig(config),
    };
  });

  const sdkCustomerChannel = {
    id: sdkCustomerChannelPayloadData.id,
    name: sdkCustomerChannelPayloadData.name,
    icon: sdkCustomerChannelPayloadData.icon,
    platforms,
  } as ISdkCustomerChannel;

  return sdkCustomerChannel;
}
