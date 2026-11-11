declare module "node:sqlite" {
  export type SQLInputValue = unknown;
  export type SQLOutputValue = string | number | bigint | Uint8Array | null;

  export class StatementSync {
    run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
    get(...params: unknown[]): Record<string, SQLOutputValue> | undefined;
    all(...params: unknown[]): Record<string, SQLOutputValue>[];
  }

  export class DatabaseSync {
    constructor(location: string, options?: { open?: boolean; readOnly?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}

declare global {
  namespace NodeJS {
    interface Process {
      getBuiltinModule?(id: string): unknown;
    }
  }
}
