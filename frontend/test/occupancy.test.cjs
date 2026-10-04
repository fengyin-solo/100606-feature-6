/**
 * 占用校验业务规则测试（纯 Node 运行，不依赖浏览器）：
 * 用内存版 localStorage 模拟前端存储，esbuild 打包 TS 后执行。
 */
const assert = require('node:assert/strict')

const storage = new Map()
globalThis.window = {
  localStorage: {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  },
}

const service = require('./build-test/test-bundle.cjs')
const { saveRows } = service

function resetStorage() {
  storage.clear()
}

function flightRow(id, partial) {
  return {
    id,
    status: '待接收',
    pending: true,
    abnormal: false,
    保障编号: `FLIG-T${String(id).padStart(3, '0')}`,
    航班号: `CA${1000 + id}`,
    机型: 'A320',
    计划到达: '2026-10-04 09:00',
    机位号: '101',
    保障等级: '普通',
    保障班组: '甲班一组',
    保障状态: '待接收',
    ...partial,
  }
}

function setupFlights(rows) {
  saveRows('flight', rows)
  saveRows('stand', [
    { id: 1, status: '空闲', pending: false, abnormal: false, 机位编号: '101' },
    { id: 2, status: '空闲', pending: false, abnormal: false, 机位编号: '102' },
    { id: 3, status: '空闲', pending: false, abnormal: false, 机位编号: '103' },
    { id: 4, status: '空闲', pending: false, abnormal: false, 机位编号: '104' },
  ])
  saveRows('team', [
    { id: 1, status: '在岗', pending: false, abnormal: false, 班组编号: 'T1', 班组名称: '甲班一组' },
    { id: 2, status: '在岗', pending: false, abnormal: false, 班组编号: 'T2', 班组名称: '甲班二组' },
    { id: 3, status: '在岗', pending: false, abnormal: false, 班组编号: 'T3', 班组名称: '乙班一组' },
  ])
  service.bootstrapOccupancy()
}

function findId(rows, id) {
  return rows.find((row) => Number(row.id) === id)
}

// 1. 存量回填 + 机位撞车：按计划到达让位，冲突条数两侧一致
{
  resetStorage()
  setupFlights([
    flightRow(1, { 计划到达: '2026-10-04 09:00' }),
    flightRow(2, { 计划到达: '2026-10-04 09:30' }), // 同机位同班组，30 分钟，撞 1
    flightRow(3, { 计划到达: '2026-10-04 11:00', 机位号: '102', 保障班组: '甲班二组' }), // 间隔 2 小时，不撞
  ])
  const report = service.flightConflictReport({})
  assert.equal(report.conflictCount, 1, '全量冲突应为 1 条')
  assert.equal(report.standEvidenceCount, 1, '机位侧证据 1 条')
  assert.equal(report.teamEvidenceCount, 1, '班组侧证据 1 条')
  const conflict = report.conflicts[0]
  assert.equal(conflict.flightId, 2, '后到的 2 号让位')
  assert.equal(conflict.ownerFlightId ?? conflict.message.includes('CA1001'), true)
  assert.ok(conflict.message.includes('101'))

  // 机位页读到的占用待办
  const stands = service.listEntries('stand').items
  const stand101 = stands.find((row) => row['机位编号'] === '101')
  assert.ok(String(stand101['占用待办']).includes('CA1002'), '机位 101 待办包含让位航班')
  // 班组页读到的占用待办
  const teams = service.listEntries('team').items
  const teamA = teams.find((row) => row['班组名称'] === '甲班一组')
  assert.ok(String(teamA['占用待办']).includes('CA1002'), '班组待办包含让位航班')

  // 两边待办非空条数一致（本场景都是 1 行记录承载）
  const standTodoRows = stands.filter((row) => String(row['占用待办'] ?? '').trim()).length
  const teamTodoRows = teams.filter((row) => String(row['占用待办'] ?? '').trim()).length
  assert.equal(standTodoRows, 1)
  assert.equal(teamTodoRows, 1)
  console.log('用例 1 通过：回填让位 + 机位/班组两侧条数一致')
}

// 2. 筛选路径：筛出十条冲突必须报十条，口径与机位、班组两侧一致
{
  resetStorage()
  const rows = []
  // 5 个机位 × 每机位两条间隔 20 分钟 = 5 条冲突、10 条命中；再放 5 条不撞的
  const pairTeams = ['甲班一组', '甲班二组', '乙班一组', '乙班二组', '丙班一组']
  const freeTeams = ['丁班一组', '丁班二组', '丁班三组', '丁班四组', '丁班五组']
  for (let i = 0; i < 5; i++) {
    const stand = String(101 + i)
    const team = pairTeams[i]
    rows.push(flightRow(10 + i * 2, {
      航班号: `HX${2000 + i}A`,
      计划到达: '2026-10-04 08:00',
      机位号: stand,
      保障班组: team,
    }))
    rows.push(flightRow(11 + i * 2, {
      航班号: `HX${2000 + i}B`,
      计划到达: '2026-10-04 08:20',
      机位号: stand,
      保障班组: team,
    }))
  }
  for (let i = 0; i < 5; i++) {
    rows.push(flightRow(100 + i, {
      航班号: `FREE${i}`,
      计划到达: `2026-10-04 1${3 + i}:00`,
      机位号: '104',
      保障班组: freeTeams[i],
    }))
  }
  setupFlights(rows)
  const filtered = service.listEntries('flight', { 计划到达: '2026-10-04' }).items
  assert.equal(filtered.length, 15)
  const report = service.flightConflictReport({ 计划到达: '2026-10-04' })
  assert.equal(report.conflictCount, 5, '筛出 15 条里 5 条冲突，不能漏报')
  assert.equal(report.conflictCount, report.standEvidenceCount, '冲突数 == 机位侧读数')
  assert.equal(report.conflictCount, report.teamEvidenceCount, '冲突数 == 班组侧读数')

  // 只按保障等级筛（这里全是普通），同样走列表筛选路径
  const levelReport = service.flightConflictReport({ 保障等级: '普通' })
  assert.equal(levelReport.conflictCount, 5)

  // 子集筛选：冲突对方在子集外也要能核出来（只筛 08:20 这一批后到方）
  const loserReport = service.flightConflictReport({ 计划到达: '2026-10-04 08:20' })
  assert.equal(loserReport.scanned, 5)
  assert.equal(loserReport.conflictCount, 5, '只看后到方也得报全 5 条')
  console.log('用例 2 通过：筛选结果冲突条数与两侧读数一致（不漏报）')
}

// 3. 机位与班组双冲突：机位为主判定，两证据同时成立
{
  resetStorage()
  setupFlights([
    flightRow(1, { 计划到达: '2026-10-04 09:00' }),
    flightRow(2, { 计划到达: '2026-10-04 09:30' }), // 机位 + 班组双撞
  ])
  const conflict = service.flightConflictReport({}).conflicts[0]
  assert.equal(conflict.kind, 'both')
  assert.equal(conflict.primary, 'stand', '双证据成立时以机位为先')
  assert.ok(conflict.message.includes('机位 101'))
  assert.ok(conflict.message.includes('班组 甲班一组'))
  console.log('用例 3 通过：双冲突机位优先，班组证据并列')
}

// 4. 接收拦截 + 幂等：撞车不能接收；重复接收只算一次占用；不跳步
{
  resetStorage()
  setupFlights([
    flightRow(1, { 计划到达: '2026-10-04 09:00' }),
    flightRow(2, { 计划到达: '2026-10-04 09:30' }),
  ])

  // 1 号先接收成功
  let r = service.runAction('flight', 1, '接收任务')
  assert.equal(r.ok, true, r.message)

  // 2 号撞车，接收被拦截
  r = service.runAction('flight', 2, '接收任务')
  assert.equal(r.ok, false)
  assert.ok(r.message.includes('占用校验拦截'))
  assert.equal(findId(service.listEntries('flight').items, 2).status, '待接收')

  // 未接收不许跳到完成
  r = service.runAction('flight', 2, '确认完成')
  assert.equal(r.ok, false)
  assert.ok(r.message.includes('不许跳步'))

  // 1 号重复接收：幂等，只算一次占用
  r = service.runAction('flight', 1, '接收任务')
  assert.equal(r.ok, true)
  assert.ok(r.message.includes('只登记一次'))

  // 1 号必须先开始保障/再完成；保障中不能再次"接收"
  r = service.runAction('flight', 1, '确认完成')
  assert.equal(r.ok, true, '保障中可确认完成')
  assert.equal(findId(service.listEntries('flight').items, 1).status, '保障完成')
  console.log('用例 4 通过：撞车拦截接收、重复接收幂等、状态不许跳步')
}

// 5. 冲突结果回写停机位待办；机位当前航班与航班任务是同一份；完成后释放
{
  resetStorage()
  setupFlights([
    flightRow(1, { 计划到达: '2026-10-04 09:00' }),
    flightRow(2, { 计划到达: '2026-10-04 09:30' }),
    flightRow(3, { 计划到达: '2026-10-04 09:45', 机位号: '102', 保障班组: '甲班二组' }),
  ])
  service.runAction('flight', 1, '接收任务')

  const standsAfterReceive = service.listEntries('stand').items
  const stand101 = standsAfterReceive.find((row) => row['机位编号'] === '101')
  assert.equal(stand101.status, '占用中')
  assert.equal(stand101['当前航班'], 'CA1001', '机位当前航班来自占用账本，同一份')
  assert.ok(String(stand101['占用待办']).includes('CA1002'))
  assert.equal(stand101['占用来源'], '航班保障占用账')

  // 完成后释放：当前航班清空、状态回空闲；此时 2 号冲突随之消解，待办清除并可直接接收
  service.runAction('flight', 1, '确认完成')
  const standsAfterDone = service.listEntries('stand').items
  const stand101Done = standsAfterDone.find((row) => row['机位编号'] === '101')
  assert.equal(stand101Done.status, '空闲')
  assert.equal(stand101Done['当前航班'], '')
  assert.equal(String(stand101Done['占用待办'] ?? '').trim(), '', '占用方完成后冲突消解，待办清除')

  // 1 号释放后 2 号不再撞（1 号已完成，不占用），应可接收
  const r = service.runAction('flight', 2, '接收任务')
  assert.equal(r.ok, true, '冲突对方完成后，让位任务可接收：' + r.message)
  const stand101Now = service.listEntries('stand').items.find((row) => row['机位编号'] === '101')
  assert.equal(stand101Now['当前航班'], 'CA1002')
  assert.equal(String(stand101Now['占用待办'] ?? '').trim(), '')

  // 未处理的 3 号（独立机位/班组）仍可正常接收，账本逐任务落位互不干扰
  assert.equal(service.runAction('flight', 3, '接收任务').ok, true)
  const stand102 = service.listEntries('stand').items.find((row) => row['机位编号'] === '102')
  assert.equal(stand102['当前航班'], 'CA1003')
  console.log('用例 5 通过：回写待办/当前航班同源、完成释放、冲突消解待办清除')
}

// 6. 班组单冲突（机位不撞）也成对留证据；班组读条数一致
{
  resetStorage()
  setupFlights([
    flightRow(1, { 计划到达: '2026-10-04 09:00', 机位号: '101', 保障班组: '甲班一组' }),
    flightRow(2, { 计划到达: '2026-10-04 09:30', 机位号: '102', 保障班组: '甲班一组' }),
  ])
  const conflict = service.flightConflictReport({}).conflicts[0]
  assert.equal(conflict.kind, 'team')
  assert.equal(conflict.primary, 'team')
  const teams = service.listEntries('team').items
  assert.ok(String(teams.find((row) => row['班组名称'] === '甲班一组')['占用待办']).includes('CA1002'))
  const stands = service.listEntries('stand').items
  // 机位侧成对待办挂在「班组联动待办」虚拟行上，保证两侧条数一致
  const virtual = stands.find((row) => row['机位编号'] === '班组联动待办')
  assert.ok(virtual, '机位侧存在班组联动待办虚拟行')
  assert.ok(String(virtual['占用待办']).includes('CA1002'))
  const standTodoRows = stands.filter((row) => String(row['占用待办'] ?? '').trim()).length
  const teamTodoRows = teams.filter((row) => String(row['占用待办'] ?? '').trim()).length
  assert.equal(standTodoRows, teamTodoRows, '两侧有待办的行数一致')
  console.log('用例 6 通过：仅班组冲突也成对回写，机位/班组条数一致')
}

// 7. 让位次序：同刻到达保障等级高者优先（要客 > 普通）
{
  resetStorage()
  setupFlights([
    flightRow(1, { 计划到达: '2026-10-04 09:00', 保障等级: '普通' }),
    flightRow(2, { 计划到达: '2026-10-04 09:00', 保障等级: '要客' }),
  ])
  const conflict = service.flightConflictReport({}).conflicts[0]
  assert.equal(conflict.flightId, 1, '同刻要客航班优先落位，普通航班让位')
  assert.ok(conflict.message.includes('CA1002'), '让位证据指向占先的要客航班 CA1002')
  console.log('用例 7 通过：同刻到达等级优先')
}

// 8. 登记即校验：登记撞车任务进待办但状态为待接收，接收时拦截
{
  resetStorage()
  setupFlights([
    flightRow(1, { 计划到达: '2026-10-04 09:00' }),
  ])
  service.runAction('flight', 1, '接收任务')
  const created = service.createFlight({
    航班号: 'CA9999',
    机型: 'B737',
    计划到达: '2026-10-04 09:20',
    机位号: '101',
    保障等级: '普通',
    保障班组: '甲班一组',
  })
  assert.equal(created.ok, true)
  assert.ok(created.conflict, '登记时返回冲突证据')
  assert.equal(created.conflict.kind, 'both')
  const newId = created.entry.id
  assert.equal(findId(service.listEntries('flight').items, newId).status, '待接收')
  const blocked = service.runAction('flight', newId, '接收任务')
  assert.equal(blocked.ok, false, '登记撞车任务不允许直接接收')

  // 登记不冲突的任务应直接可接收
  const free = service.createFlight({
    航班号: 'CA8888',
    机型: 'A320',
    计划到达: '2026-10-04 15:00',
    机位号: '103',
    保障等级: '普通',
    保障班组: '乙班一组',
  })
  assert.equal(free.conflict, null)
  assert.equal(service.runAction('flight', free.entry.id, '接收任务').ok, true)
  console.log('用例 8 通过：登记即校验、冲突入账、接收拦截')
}

// 9. 时间窗边界：相隔正好 60 分钟不算撞（左闭右开）
{
  resetStorage()
  setupFlights([
    flightRow(1, { 计划到达: '2026-10-04 09:00' }),
    flightRow(2, { 计划到达: '2026-10-04 10:00' }),
  ])
  assert.equal(service.flightConflictReport({}).conflictCount, 0, '60 分钟边界不冲突')
  console.log('用例 9 通过：60 分钟左闭右开边界')
}

// 10. 仅机位冲突（班组不撞）：班组侧挂机位联动待办，两证据成对
{
  resetStorage()
  setupFlights([
    flightRow(1, { 计划到达: '2026-10-04 09:00', 机位号: '101', 保障班组: '甲班一组' }),
    flightRow(2, { 计划到达: '2026-10-04 09:30', 机位号: '101', 保障班组: '甲班二组' }),
  ])
  const conflict = service.flightConflictReport({}).conflicts[0]
  assert.equal(conflict.kind, 'stand')
  assert.equal(conflict.primary, 'stand')
  const stands = service.listEntries('stand').items
  assert.ok(String(stands.find((row) => row['机位编号'] === '101')['占用待办']).includes('CA1002'))
  const teams = service.listEntries('team').items
  // 甲班二组并未撞班，其待办是机位联动证据
  assert.ok(String(teams.find((row) => row['班组名称'] === '甲班二组')['占用待办']).includes('机位联动待办'))
  assert.equal(
    stands.filter((row) => String(row['占用待办'] ?? '').trim()).length,
    teams.filter((row) => String(row['占用待办'] ?? '').trim()).length,
  )
  console.log('用例 10 通过：仅机位冲突班组侧挂联动待办，两侧成对')
}

console.log('\n全部占用校验测试通过 ✅')
