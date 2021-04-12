export const SQLWhereClause = (columnName, offset, date) => {
  const ans = `("${columnName}" ${offset[0]} interval '${offset[1]}${offset[2]} hours')::Date = '${date}'`;
  return ans;
};
