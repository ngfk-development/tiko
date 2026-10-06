export const PROVIDER_ICON_SIZE_CLASSES = {
  sm: 'size-6 rounded-sm text-xs',
  default: 'size-10 rounded-md text-base',
  lg: 'size-14 rounded-lg text-xl',
};

export type ProviderIconSize = keyof typeof PROVIDER_ICON_SIZE_CLASSES;

export const PROVIDER_ICON_SIZES = Object.keys(
  PROVIDER_ICON_SIZE_CLASSES,
) as ProviderIconSize[];
