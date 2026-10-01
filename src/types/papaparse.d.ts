declare module 'papaparse' {
  export interface ParseConfig<T = any> {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    transformHeader?: (header: string, index?: number) => string;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    step?: (results: ParseResult<T>, parser: any) => void;
    complete?: (results: ParseResult<T>, file?: File) => void;
    error?: (error: any, file?: File) => void;
    download?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    chunk?: (results: ParseResult<T>, parser: any) => void;
    fastMode?: boolean;
    beforeFirstChunk?: (chunk: string) => string | void;
    withCredentials?: boolean;
    transform?: (value: string, field: string | number) => any;
    delimitersToGuess?: string[];
  }

  export interface ParseError {
    type: string;
    code: string;
    message: string;
    row: number;
  }

  export interface ParseMeta {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    fields?: string[];
    truncated: boolean;
    cursor: number;
  }

  export interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
    meta: ParseMeta;
  }

  export function parse<T = any>(file: File | string, config?: ParseConfig<T>): ParseResult<T> | void;
  export function unparse(data: any[] | any, config?: any): string;

  const papa: {
    parse: typeof parse;
    unparse: typeof unparse;
  };

  export default papa;
}
