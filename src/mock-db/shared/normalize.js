export function table(records) {
  const byId = Object.fromEntries(records.map((record) => [record.id, record]))
  return { byId, allIds: records.map((record) => record.id) }
}

export function denormalize(tableState) {
  return tableState.allIds.map((id) => tableState.byId[id])
}

export function createMockDomain(recordsByEntity) {
  return Object.fromEntries(
    Object.entries(recordsByEntity).map(([entityName, records]) => [entityName, table(records)])
  )
}

export function assertReferences(db, checks) {
  return checks.flatMap(({ entity, field, target, many = false, optional = false }) => {
    return db[entity].allIds.flatMap((id) => {
      const value = db[entity].byId[id][field]
      const values = many ? value || [] : [value]
      if (optional && (value === null || value === undefined)) return []
      return values
        .filter((targetId) => targetId && !db[target].byId[targetId])
        .map((targetId) => `${entity}.${id}.${field} references missing ${target}.${targetId}`)
    })
  })
}

