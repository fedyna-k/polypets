type InnerCache = Record<string, Record<string, string>[]>;
type CacheParameters = {
  category: string;
  value: Record<string, string>;
};

/**
 * Cache API.
 * Simple category KV cache system.
 * 
 * @example
 * {
 *   game: [
 *     { id: 1, player1: "Ben", player2: "Dover" },
 *     { id: 2, player1: "Joe", player2: "Mama" },
 *   ]
 * }
 */
export default class Cache {
  static $instance: InnerCache = {};

  /**
   * Creates a new category in cache.
   * @param category The category name.
   */
  static createCategory(category: string) {
    if (this.$instance[category] != undefined) {
      throw new Error(`Category "${category}" already exists in cache.`);
    }

    this.$instance[category] = [];
  }

  /**
   * Adds a new value to the cache.
   * @param params The category and value object.
   */
  static add(params: CacheParameters) {
    if (this.$instance[params.category] == undefined) {
      throw new Error(`Category "${params.category}" doesn't exist in cache.`);
    }

    this.$instance[params.category]?.push(params.value);
  }

  /**
   * Adds a new value to the cache.
   * @param params The category and value object.
   */
  static remove(params: CacheParameters) {
    if (this.$instance[params.category] == undefined) {
      throw new Error(`Category "${params.category}" doesn't exist in cache.`);
    }

    /**
     * Compares two object for a pseudo equal relationship.
     * @param a First object.
     * @param b Second object.
     * @returns True if equal according to the function.
     */
    const comparisonFunction = (a: Record<string, string>, b: Record<string, string>) => {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      return keysA.length == keysB.length && keysA.reduce((acc, key) => a[key] == b[key] && acc, true);
    }

    this.$instance[params.category] = this.$instance[params.category]?.filter(value => comparisonFunction(value, params.value)) ?? [];
  }
}