declare module 'connect-pg-simple' {
  import session from 'express-session';
  
  interface PgStoreOptions {
    conString?: string;
    conObject?: object;
    ttl?: number;
    createTableIfMissing?: boolean;
    tableName?: string;
    schemaName?: string;
    columnNames?: {
      session_id?: string;
      session_data?: string;
      expire?: string;
    };
    pruneSessionInterval?: number;
    errorLog?: (...args: any[]) => void;
  }
  
  export default function connectPgSimple(session: typeof import('express-session')): new (options: PgStoreOptions) => session.Store;
}