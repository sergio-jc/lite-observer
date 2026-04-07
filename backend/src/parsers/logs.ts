import type { InferInsertModel } from 'drizzle-orm';
import type { logs } from '../db/schema.js';
import {
  base64ToHex,
  extractServiceName,
  flattenAttributes,
} from './common.js';
import type { KeyValue, AnyValue, Resource } from './common.js';

type LogRow = InferInsertModel<typeof logs>;

interface OtlpLogRecord {
  timeUnixNano?: string;
  observedTimeUnixNano?: string;
  severityNumber?: number;
  severityText?: string;
  body?: AnyValue;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
  traceId?: string;
  spanId?: string;
}

interface ScopeLogs {
  scope?: { name?: string; version?: string };
  logRecords?: OtlpLogRecord[];
}

interface ResourceLogs {
  resource?: Resource;
  scopeLogs?: ScopeLogs[];
}

export function parseResourceLogs(resourceLogs: ResourceLogs[]): LogRow[] {
  const rows: LogRow[] = [];

  for (const rl of resourceLogs) {
    const serviceName = extractServiceName(rl.resource);
    const resourceAttributes = flattenAttributes(rl.resource?.attributes);

    for (const sl of rl.scopeLogs ?? []) {
      const scopeName = sl.scope?.name ?? '';
      const scopeVersion = sl.scope?.version ?? '';

      for (const log of sl.logRecords ?? []) {
        rows.push({
          timeUnixNano: log.timeUnixNano ?? log.observedTimeUnixNano ?? '0',
          observedTimeUnixNano: log.observedTimeUnixNano ?? '',
          severityNumber: log.severityNumber ?? 0,
          severityText: log.severityText ?? '',
          body: extractBody(log.body),
          traceId: log.traceId ? base64ToHex(log.traceId) : null,
          spanId: log.spanId ? base64ToHex(log.spanId) : null,
          serviceName,
          resourceAttributes,
          attributes: flattenAttributes(log.attributes),
          scopeName,
          scopeVersion,
        });
      }
    }
  }

  return rows;
}

function extractBody(body?: AnyValue): string {
  if (!body) return '';
  if (body.stringValue !== undefined) return body.stringValue;
  if (body.intValue !== undefined) return String(body.intValue);
  if (body.doubleValue !== undefined) return String(body.doubleValue);
  if (body.boolValue !== undefined) return String(body.boolValue);

  return JSON.stringify(body);
}
