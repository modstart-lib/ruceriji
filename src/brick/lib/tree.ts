const Tree = {
  filterAncestors(tree: any[], value: any, valueKey?: string, childKey?: string): any {
    valueKey = valueKey || 'id'
    childKey = childKey || '_child'
    let result: any = null
    tree.forEach((o) => {
      let children
      if (o[valueKey!] === value) {
        result = Object.assign({}, o)
        delete result[childKey!]
        return result
      }
      if (o[childKey!] && (children = Tree.filterAncestors(o[childKey!], value, valueKey, childKey))) {
        const oo: any = {}
        oo[childKey!] = children
        result = Object.assign({}, o, oo)
        return result
      }
    })
    return result
  },

  listAncestors(singleTree: any, value: any, valueKey?: string, childKey?: string): any[] {
    valueKey = valueKey || 'id'
    childKey = childKey || '_child'
    const parents = Tree.filterAncestors(singleTree, value, valueKey, childKey)
    if (null === parents) {
      return []
    }
    let node = parents
    const list: any[] = []
    do {
      const o = Object.assign({}, node)
      delete o[childKey!]
      list.push(o)
    } while ((node = node[childKey!]))
    return list
  },

  sort(nodes: any[], id?: any, idKey?: string, pidKey?: string, sortKey?: string): any[] {
    id = id || ''
    idKey = idKey || 'id'
    pidKey = pidKey || 'pid'
    sortKey = sortKey || 'sort'
    nodes.map((o) => {
      if (!o[idKey!]) {
        o[idKey!] = ''
      }
      if (!o[pidKey!]) {
        o[pidKey!] = ''
      }
    })
    nodes = nodes.sort((a, b) => {
      return a[sortKey!] - b[sortKey!]
    })
    return Tree._sort(nodes, id, idKey, pidKey, sortKey)
  },

  _sort(
    list: any[],
    id: any,
    idKey?: string,
    pidKey?: string,
    sortKey?: string,
    level?: number,
    ids?: Record<string, boolean>
  ): any[] {
    level = level || 1
    ids = ids || {}
    const result: any[] = []
    list
      .filter((o) => o[pidKey!] === id)
      .forEach((o) => {
        if (o[idKey!] in ids!) {
          throw 'duplicate sort tree : ' + JSON.stringify(o) + ' ' + JSON.stringify(ids)
        }
        ids![o[idKey!]] = true
        result.push(Object.assign(o, { level: level }))
        const ret = Tree._sort(list, o[idKey!], idKey, pidKey, sortKey, level! + 1, ids)
        ret.forEach((oo) => {
          result.push(Object.assign(oo))
        })
      })
    return result
  },

  tree(nodes: any[], id?: any, idKey?: string, pidKey?: string, sortKey?: string, childrenKey?: string): any[] {
    id = id || ''
    idKey = idKey || 'id'
    pidKey = pidKey || 'pid'
    sortKey = sortKey || 'sort'
    childrenKey = childrenKey || '_child'
    nodes.map((o) => {
      if (!o[idKey!]) {
        o[idKey!] = ''
      }
      if (!o[pidKey!]) {
        o[pidKey!] = ''
      }
    })
    nodes = nodes.sort((a, b) => {
      return a[sortKey!] - b[sortKey!]
    })
    return Tree._tree(nodes, id, idKey, pidKey, sortKey, childrenKey)
  },

  _tree(
    list: any[],
    id: any,
    idKey?: string,
    pidKey?: string,
    sortKey?: string,
    childrenKey?: string,
    level?: number,
    ids?: Record<string, boolean>
  ): any[] {
    level = level || 1
    ids = ids || {}
    const result: any[] = []
    list
      .filter((o) => o[pidKey!] === id)
      .forEach((o) => {
        if (o[idKey!] in ids!) {
          throw 'duplicate sort tree : ' + JSON.stringify(o) + ' ' + JSON.stringify(ids)
        }
        ids![o[idKey!]] = true
        const addition: any = { level: level }
        addition[childrenKey!] = Tree._tree(list, o[idKey!], idKey, pidKey, sortKey, childrenKey, level! + 1, ids)
        if (!addition[childrenKey!].length) {
          delete addition[childrenKey!]
        }
        result.push(Object.assign(o, addition))
      })
    return result
  },

  nodes(tree: any[], idKey?: string, pidKey?: string, sortKey?: string, childrenKey?: string): any[] {
    idKey = idKey || 'id'
    pidKey = pidKey || 'pid'
    sortKey = sortKey || 'sort'
    childrenKey = childrenKey || '_child'
    return Tree._nodes(JSON.parse(JSON.stringify(tree)), '', idKey, pidKey, sortKey, childrenKey)
  },

  _nodes(
    tree: any[],
    id: any,
    idKey?: string,
    pidKey?: string,
    sortKey?: string,
    childrenKey?: string,
    level?: number
  ): any[] {
    level = level || 1
    const result: any[] = []
    tree.forEach((o) => {
      const node = o
      node[pidKey!] = id
      node.level = level
      if (childrenKey! in node && typeof node[childrenKey!] === 'object') {
        const children = node[childrenKey!]
        delete node[childrenKey!]
        result.push(node)
        Tree._nodes(children, node[idKey!], idKey, pidKey, sortKey, childrenKey, level! + 1).forEach((oo) => {
          result.push(oo)
        })
      } else {
        delete node[childrenKey!]
        result.push(node)
      }
    })
    return result
  },

  resortAndDiff(listNew: any[], listOld: any[], idKey?: string, pidKey?: string, sortKey?: string): any[] {
    idKey = idKey || 'id'
    pidKey = pidKey || 'pid'
    sortKey = sortKey || 'sort'
    const oldMap: Record<string, any> = {}
    listOld.forEach((o) => (oldMap[o[idKey!]] = o))
    let sort = 1
    listNew.forEach((o) => (o[sortKey!] = sort++))
    const diffList: any[] = []
    listNew.forEach((o) => {
      if (o[idKey!] in oldMap) {
        const old = oldMap[o[idKey!]]
        if (old[pidKey!] === o[pidKey!] && old[sortKey!] === o[sortKey!]) {
        } else {
          diffList.push(o)
        }
      } else {
        diffList.push(o)
      }
    })
    return diffList
  },
}

export { Tree }
