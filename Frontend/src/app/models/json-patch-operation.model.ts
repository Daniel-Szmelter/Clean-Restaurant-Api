export interface JsonPatchOperation {
  op: 'replace' | 'add' | 'remove';
  path: string;
  value?: any;
}
