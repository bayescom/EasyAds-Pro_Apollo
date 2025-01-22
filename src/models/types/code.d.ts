type CodeType = 'platform_type'
  | 'layout'
  | 'versionOperator'
  | 'role_type'
  ;

interface Code {
  name: string,
  value: string | number,
  extension?: string,
  extensionMap?: extensionMap,
  children?: Code[]
}
type extensionMap = {
  maxConfig: [],
  minConfig: [],
  desc: ''
}

export { Code, CodeType };
