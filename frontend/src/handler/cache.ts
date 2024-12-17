const $instance: InnerCache = {};

/**
 * Equality function between two `KeyValue` objects.
 * @param a First object.
 * @param b Second object.
 * @returns `true` if a equals b, `false` otherwise.
 */
function areRecordsEqual(a: KeyValue, b: KeyValue): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  // Assert that keys are the same size.
  if (keysA.length != keysB.length) {
    return false;
  }
 
  // Assert that every key of A maps to exactly one key of B.
  const keyMapStatus: boolean[] = Array
    .from({ length: keysA.length })
    .map((_, index) => keysB.includes(keysA[index]!));

  if (keyMapStatus.includes(false)) {
    return false;
  }

  return keysA.reduce((acc, key) => a[key] == b[key] && acc, true);
}

/**
 * Cache API.
 * Simple category KV cache system.
 * 
 * @example
 * {
 *   game: [
 *     { id: "1", player1: "Ben", player2: "Dover" },
 *     { id: "2", player1: "Joe", player2: "Mama" },
 *   ]
 * }
 */
export default class Cache {
  /**
   * Creates a new category in cache.
   * @param category The category name.
   */
  static createCategory(category: string): void {
    if ($instance[category] != undefined) {
      throw new Error(`Category "${category}" already exists in cache.`);
    }

    $instance[category] = [];
  }

  /**
   * Gets the full category without filters.
   * @param category The category name.
   * @returns The full category.
   */
  static getCategory(category: string): KeyValue[] {
    if ($instance[category] == undefined) {
      throw new Error(`Category "${category}" already exists in cache.`);
    }

    return $instance[category];
  }

  /**
   * Adds a new value to the cache.
   * @param params The category and value object.
   */
  static add(params: CacheCreateParameters): void {
    if ($instance[params.category] == undefined) {
      throw new Error(`Category "${params.category}" doesn't exist in cache.`);
    }

    $instance[params.category]!.push(params.value);
  }

  /**
   * Gets all matching values from the cache.
   * @param params The category and criteria object.
   * @returns The KeyValue objects that match the criteria.
   */
  static find(params: CacheReadParameters): KeyValue[] {
    if ($instance[params.category] == undefined) {
      throw new Error(`Category "${params.category}" doesn't exist in cache.`);
    }

    const criteriaKeys = Object.keys(params.criteria);
    return $instance[params.category]!.filter(value => criteriaKeys.every(key => params.criteria[key] == value[key]));
  }

  /**
   * Edits a value from the cache.
   * @param params The category, old and new object.
   */
  static edit(params: CacheUpdateParameters): void {
    if ($instance[params.category] == undefined) {
      throw new Error(`Category "${params.category}" doesn't exist in cache.`);
    }

    $instance[params.category] = $instance[params.category]!.filter(value => !areRecordsEqual(value, params.old));
    $instance[params.category]!.push(params.new);
  }

  /**
   * Removes a value from the cache.
   * @param params The category and value object.
   */
  static remove(params: CacheDeleteParameters): void {
    if ($instance[params.category] == undefined) {
      throw new Error(`Category "${params.category}" doesn't exist in cache.`);
    }

    $instance[params.category] = $instance[params.category]!.filter(value => !areRecordsEqual(value, params.value));
  }

  /**
   * Removes all matching values from the cache.
   * @param params The category and criteria object.
   */
  static findRemove(params: CacheReadParameters): void {
    if ($instance[params.category] == undefined) {
      throw new Error(`Category "${params.category}" doesn't exist in cache.`);
    }

    const criteriaKeys = Object.keys(params.criteria);
    $instance[params.category] = $instance[params.category]!.filter(value => !criteriaKeys.every(key => params.criteria[key] == value[key]));
  }
}