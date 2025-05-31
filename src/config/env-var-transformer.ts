// Transform flattened env vars with __ separator into nested object
export function transformEnvVars(
  env: NodeJS.ProcessEnv,
): Record<string, unknown> {
  const result: Record<string, Record<string, string> | string | undefined> =
    {};

  Object.keys(env).forEach((key) => {
    if (key.includes('__')) {
      const parts = key.split('__');
      if (parts.length === 2) {
        const [parent, child] = parts;

        // Ensure parent exists and is an object
        if (!result[parent] || typeof result[parent] === 'string') {
          result[parent] = {};
        }

        // Type assertion to tell TypeScript this is definitely a Record now
        const parentObj = result[parent];
        parentObj[child] = env[key] as string;
      }
    } else {
      result[key] = env[key];
    }
  });

  return result;
}
