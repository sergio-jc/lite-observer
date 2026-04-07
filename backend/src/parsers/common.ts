interface KeyValue {
  key: string;
  value: AnyValue;
}

interface AnyValue {
  stringValue?: string;
  intValue?: string | number;
  doubleValue?: number;
  boolValue?: boolean;
  arrayValue?: { values: AnyValue[] };
  kvlistValue?: { values: KeyValue[] };
  bytesValue?: string;
}

interface Resource {
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
}

export type { KeyValue, AnyValue, Resource };

export function base64ToHex(b64: string): string {
  if (/^[0-9a-fA-F]+$/.test(b64)) return b64.toLowerCase();

  const bytes = Buffer.from(b64, 'base64');
  return bytes.toString('hex');
}

export function extractServiceName(resource?: Resource): string {
  if (!resource?.attributes) return 'unknown';

  const attr = resource.attributes.find((a) => a.key === 'service.name');
  if (!attr?.value) return 'unknown';

  return resolveAnyValue(attr.value)?.toString() ?? 'unknown';
}

export function flattenAttributes(
  attrs?: KeyValue[],
): Record<string, unknown> {
  if (!attrs || attrs.length === 0) return {};

  const result: Record<string, unknown> = {};
  for (const attr of attrs) {
    result[attr.key] = resolveAnyValue(attr.value);
  }
  return result;
}

function resolveAnyValue(value: AnyValue): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.intValue !== undefined) return Number(value.intValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.boolValue !== undefined) return value.boolValue;
  if (value.bytesValue !== undefined) return value.bytesValue;

  if (value.arrayValue?.values) {
    return value.arrayValue.values.map(resolveAnyValue);
  }

  if (value.kvlistValue?.values) {
    return flattenAttributes(value.kvlistValue.values);
  }

  return null;
}

export function computeDurationMs(
  startNano: string | undefined,
  endNano: string | undefined,
): number {
  if (!startNano || !endNano) return 0;
  try {
    const diff = BigInt(endNano) - BigInt(startNano);
    return Number(diff) / 1_000_000;
  } catch {
    return 0;
  }
}
