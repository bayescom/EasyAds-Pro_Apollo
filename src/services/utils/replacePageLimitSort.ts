export default function(params) {
  if (params.current) {
    params.page = params.current;
    delete params.current;
  }

  if (params.pageSize) {
    params.limit = params.pageSize; 
    delete params.pageSize;
  }

  if (params.dir) {
    params.dir = params.dir.replace('end', '');
  }

  return params;
}
