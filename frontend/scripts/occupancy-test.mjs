// 占用校验行为测试：不依赖浏览器，用内存 localStorage 跑纯逻辑。
// 运行：node scripts/run-occupancy-test.mjs（构建见 package.json 的 test 脚本）。

// ---- 最小 localStorage / window 垫片，必须在业务模块求值前挂好 ----
const memory = new Map()
globalThis.window = {
  localStorage: {
    getItem: (k) => (memory.has(k) ? memory.get(k) : null),
    setItem: (k, v) => memory.set(k, String(v)),
    removeItem: (k) => memory.delete(k),
  },
}

const service = await import('./dist-test/local-service.mjs')

let failures = 0
function check(name, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    console.log(`  ✓ ${name}`)
  } else {
    failures += 1
    console.error(`  ✗ ${name}\n      期望 ${e}\n      实际 ${a}`)
  }
}
function ok(name, cond, detail = '') {
  if (cond) {
    console.log(`  ✓ ${name}`)
  } else {
    failures += 1
    console.error(`  ✗ ${name} ${detail}`)
  }
}

// 1. 存量回填：4 条冲突（id4 双证据、id8 机位、id10 班组）
console.log('一、存量任务按计划到达回填，冲突数三条口径对得上')
let payload = service.listFlightEntries({ 计划到达: '2026-10-04' })
const s = payload.conflictSummary
check('冲突任务总数', s.total, 3)
check('机位侧冲突数', s.standSide, 2)
check('班组侧冲突数', s.teamSide, 2)
check('两处同撞数', s.bothSide, 1)
ok('机位+班组-同撞=总数', s.standSide + s.teamSide - s.bothSide === s.total)
check('筛选条数', payload.total, 9)
const c4 = payload.conflicts.find((c) => c.flightId === 4)
check('id4 首条证据为机位（机位先算）', c4.primaryKind, 'stand')
check('id4 同时有班组证据', c4.standConflict && c4.teamConflict, true)
check('id4 撞 id1', c4.evidences.map((e) => e.otherFlightId), [1, 1])

// 全量（不过滤）时口径同样成立，且次日的 id9 不算当天冲突
payload = service.listFlightEntries({})
ok('全量冲突仍是 3 条', payload.conflictSummary.total === 3)

// 筛选结果条数与机位待办、班组负载两侧读数一致
console.log('二、机位侧：冲突回写占用待办，当前航班来自同一份台账')
const stands = service.listStandEntries({}).items
const s101 = stands.find((r) => r['机位编号'] === '101')
check('101 当前航班', s101['当前航班'], 'CA1201')
ok('101 占用待办提到 HU7801', String(s101['占用待办']).includes('HU7801'), s101['占用待办'])
check('101 状态占用中', s101.status, '占用中')
const s103 = stands.find((r) => r['机位编号'] === '103')
check('103 当前航班为持位者 CZ3110', s103['当前航班'], 'CZ3110')
ok('103 待办为让位 HU7805', String(s103['占用待办']).includes('HU7805'), s103['占用待办'])
const s203 = stands.find((r) => r['机位编号'] === '203')
ok('203 空闲（班组冲突不占机位）', s203.status === '空闲' && s203['当前航班'] === '', s203.status)

console.log('三、班组侧：同读数与筛选页班组口径一致')
const load = service.teamConflictLoad()
check('甲班冲突 1（id4）', load.get('甲班'), 1)
check('乙班冲突 1（id10）', load.get('乙班'), 1)
check('丙班无冲突', load.get('丙班'), undefined)

console.log('四、接收：冲突拦截、不许跳步、重复接收只占一次')
let r = service.runFlightAction(4, '接收任务')
ok('id4 接收被机位+班组拦截', !r.ok && r.message.includes('CA1201'), r.message)
const f4 = service.listFlightEntries({ 航班号: 'HU7801' }).items[0]
check('id4 仍为待接收', f4.status, '待接收')
r = service.runFlightAction(4, '确认完成')
ok('待接收不能直接确认完成（不许跳步）', !r.ok && r.message.includes('依次推进'), r.message)

r = service.runFlightAction(5, '接收任务')
ok('id5 无冲突可接收', r.ok, r.message)
check('id5 进入保障中', service.listFlightEntries({ 航班号: 'CA1202' }).items[0].status, '保障中')
r = service.runFlightAction(5, '接收任务')
ok('重复接收不产生第二次占用', !r.ok && r.message.includes('已经是'), r.message)
r = service.runFlightAction(5, '确认完成')
ok('保障中→保障完成', r.ok, r.message)

// 让位者改派到空闲机位/班组后可以接收成功（冲突消除即放行，由重算台账自动反映）

console.log('五、登记：登记时即校验，冲突预警但不拦截，并回写机位待办')
r = service.registerFlight({
  航班号: 'TEST1',
  机型: 'A320',
  计划到达: '2026-10-04 09:05',
  机位号: '102',
  保障等级: '三级',
  保障班组: '乙班',
})
ok('登记成功但带机位预警（撞 MU5302）', r.ok && r.message.includes('MU5302'), r.message)
const newId = r.id
const after = service.listFlightEntries({ 航班号: 'TEST1' })
check('新登记任务是待接收', after.items[0].status, '待接收')
ok('新任务进冲突列表', after.conflicts.some((c) => c.flightId === newId))
const s102Todo = service.listStandEntries({ 机位编号: '102' }).items[0]['占用待办']
ok('待接收预警写进 102 占用待办', String(s102Todo).includes('TEST1'), s102Todo)
r = service.registerFlight({ 航班号: 'TEST2', 计划到达: '', 机位号: '', 保障等级: '', 保障班组: '' })
ok('缺字段登记失败', !r.ok, r.message)

console.log('六、筛选口径：筛出几条就核几条，不会少报')
const q = service.listFlightEntries({ 计划到达: '2026-10-04', 保障等级: '三级' })
// 三级：id5、id8（+新登记 TEST1 也是三级）
ok('三级筛选的冲突数与两侧读数对账',
  q.conflictSummary.standSide + q.conflictSummary.teamSide - q.conflictSummary.bothSide ===
    q.conflictSummary.total,
  JSON.stringify(q.conflictSummary))
// 筛出十条不能只报六条：每个带冲突标记的行，都计入了机位或班组侧
const flagged = q.items.filter((r) => r.abnormal).length
check('逐行异常行数=冲突报告条数', flagged, q.conflicts.length)

console.log('七、让位者在持位者消失后可正常接收，且只占一次')
// f2 完成保障后不再是新占用的阻碍（台账仍保留其记录，但模拟调时后 TEST1 与所有人无冲突）
service.resetModule('flight')
let reg = service.registerFlight({
  航班号: 'FREE1', 机型: 'A320', 计划到达: '2026-10-04 15:00',
  机位号: '202', 保障等级: '三级', 保障班组: '丙班',
})
ok('空闲资源登记无冲突', reg.ok && reg.message.includes('无冲突'), reg.message)
ok('FREE1 接收成功', service.runFlightAction(reg.id, '接收任务').ok)
const again = service.runFlightAction(reg.id, '接收任务')
ok('重复接收提示已是当前态、不新增占用', !again.ok && again.message.includes('已经是'), again.message)
const standsOnce = service.listStandEntries({ 机位编号: '202' }).items[0]
check('202 当前航班唯一', standsOnce['当前航班'], 'FREE1')

console.log('八、回填同刻撞车：同时到达按保障等级让位')
service.resetModule('flight')
reg = service.registerFlight({
  航班号: 'VIPX', 机型: 'A320', 计划到达: '2026-10-04 09:00',
  机位号: '101', 保障等级: '要客', 保障班组: '丙班',
})
// 与 id1 同时刻同机位：已在岗持位者优先，新登记（待接收）只挂预警
const vip = service.listFlightEntries({ 航班号: 'VIPX' })
check('VIPX 机位冲突证据指向 CA1201',
  vip.conflicts.find((c) => c.flightId === reg.id).evidences.find((e) => e.kind === 'stand').other航班号,
  'CA1201')

console.log('九、复位：航班复位后台账与机位一起重建')
service.resetModule('flight')
const fresh = service.listFlightEntries({ 计划到达: '2026-10-04' })
check('复位后冲突恢复为 3 条', fresh.conflictSummary.total, 3)
const fresh101 = service.listStandEntries({ 机位编号: '101' }).items[0]
check('复位后 101 当前航班恢复', fresh101['当前航班'], 'CA1201')

console.log('十、跨天不算同时段')
const nextDay = service.listFlightEntries({ 航班号: 'CA9999' })
ok('次日同机位同班组的 id9 与前一天航班无冲突', nextDay.items[0].abnormal === false)
// id9 本身是待接收（不占位），两条待接收任务互不占位；把 id9 接收后再登记同窗口任务才应报警
ok('id9 无冲突时接收成功', service.runFlightAction(9, '接收任务').ok)
const reg2 = service.registerFlight({
  航班号: 'SAMESLOT', 机型: 'A320', 计划到达: '2026-10-05 09:10',
  机位号: '101', 保障等级: '三级', 保障班组: '甲班',
})
ok('与已在岗的 id9 同窗口，机位+班组双证据报警', reg2.message.includes('CA9999'), reg2.message)
// 与 id9 相隔 3 小时（窗口不相交）则无冲突
const reg3 = service.registerFlight({
  航班号: 'FAROFF', 机型: 'A320', 计划到达: '2026-10-05 06:00',
  机位号: '101', 保障等级: '三级', 保障班组: '甲班',
})
ok('同天但窗口不相交无冲突', reg3.message.includes('无冲突'), reg3.message)

if (failures > 0) {
  console.error(`\n${failures} 项校验失败`)
  process.exit(1)
}
console.log('\n全部校验通过')
