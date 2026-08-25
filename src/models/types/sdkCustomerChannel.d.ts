type SdkCustomerChannelAdapterTypeKey = string;

interface ISdkCustomerChannelAdapterItem {
  type: SdkCustomerChannelAdapterTypeKey;
  className: string;
}

interface ISdkCustomerChannelPlatformConfig {
  osConfigId?: number;
  enabled: boolean;
  module_name: string;
  initClassName: string;
  adapters: ISdkCustomerChannelAdapterItem[];
}

interface ISdkCustomerChannelPlatformOption {
  osType: number;
  name: string;
}

interface ISdkCustomerChannel {
  id: number;
  name: string;
  icon?: string;
  platforms: Partial<Record<number, ISdkCustomerChannelPlatformConfig>>;
}

interface ISdkCustomerChannelFormValues {
  name: string;
  icon?: string | string[];
  platforms: Record<number, ISdkCustomerChannelPlatformConfig>;
}

interface ISdkCustomerChannelOsConfig {
  id?: number;
  sdkCustomerChannelId?: number;
  osType: number;
  status: number;
  config: string | null;
}

interface ISdkCustomerChannelApiItem {
  id: number;
  name: string;
  icon?: string;
  osConfigs: ISdkCustomerChannelOsConfig[];
}
