const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Whether a value from a URL can be a row id. Postgres rejects anything else
 * in a uuid column with an error, so routes check first and answer 404.
 */
export function isUuid(value: string): boolean {
  return UUID.test(value);
}
