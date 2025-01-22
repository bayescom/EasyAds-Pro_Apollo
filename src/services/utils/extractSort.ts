export default function(sort) {
  const sortKey = Object.keys(sort)[0];
  return {
    sort: sortKey,
    dir: sort[sortKey]
  };
}
