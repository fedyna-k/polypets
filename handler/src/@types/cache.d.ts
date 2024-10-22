declare type KeyValue = Record<string, string>;
declare type InnerCache = Record<string, KeyValue[]>;

declare type CacheCreateParameters = {
  category: string;
  value: KeyValue;
};

declare type CacheReadParameters = {
  category: string;
  criteria: KeyValue;
};

declare type CacheUpdateParameters = {
  category: string;
  old: KeyValue;
  new: KeyValue;
};

declare type CacheDeleteParameters = CacheCreateParameters;