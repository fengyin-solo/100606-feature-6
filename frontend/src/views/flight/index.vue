<template>
  <section class="page" data-module="flight">
    <header class="page-head">
      <div>
        <h2>航班保障管理</h2>
        <p class="page-desc">值班员先按计划到达与保障等级筛出当天要接的任务，再逐条看机位与班组占用冲突；冲突条数与机位、班组两侧读到的数一致。</p>
      </div>
      <div class="page-actions">
        <button class="btn primary" type="button" @click="openCreate">登记航班保障任务</button>
        <button class="btn" type="button" @click="exportRows">导出航班保障清单</button>
      </div>
    </header>

    <div class="stat-row">
      <article v-for="item in stats" :key="item.label" class="stat-card">
        <span class="stat-label">{{ item.label }}</span>
        <strong class="stat-value">{{ item.value }}</strong>
      </article>
    </div>

    <p class="status-legend">
      <span v-for="item in statusSummary" :key="item.status" class="legend-item">
        {{ item.status }}：{{ item.count }}
      </span>
    </p>

    <div class="conflict-strip">
      <span class="legend-item">筛选结果冲突：<b>{{ summary.total }}</b> 条</span>
      <span class="legend-item">机位侧（占用待办汇总）：<b>{{ summary.standSide }}</b> 条</span>
      <span class="legend-item">班组侧（在岗冲突汇总）：<b>{{ summary.teamSide }}</b> 条</span>
      <span class="legend-item neutral">两处同撞：<b>{{ summary.bothSide }}</b> 条</span>
      <span class="consistency" :class="{ ok: consistent }">{{
        consistent ? '✓ 口径对账一致：机位+班组-同撞=总数' : '× 三条口径对不上账'
      }}</span>
    </div>

    <form class="filter-bar" @submit.prevent="reload">
      <label class="filter-item">
        <span>计划到达</span>
        <input v-model="filters['计划到达']" placeholder="如 2026-10-04" />
      </label>
      <label class="filter-item">
        <span>保障等级</span>
        <input v-model="filters['保障等级']" placeholder="要客/一级/二级/三级" />
      </label>
      <label class="filter-item">
        <span>航班号</span>
        <input v-model="filters['航班号']" placeholder="按航班号检索" />
      </label>
      <button class="btn" type="submit">查询</button>
      <button class="btn ghost" type="button" @click="resetFilters">重置条件</button>
    </form>

    <table class="data-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column">{{ column }}</th>
          <th>冲突校验</th>
          <th>当前状态</th>
          <th>可执行动作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="String(row.id)" :class="{ conflicted: row.abnormal }">
          <td v-for="column in columns" :key="column">{{ row[column] ?? '—' }}</td>
          <td>
            <span v-if="row.abnormal" class="conflict-cell">
              <b>{{ row['冲突标记'] }}</b>
              <small>{{ row['冲突证据'] }}</small>
            </span>
            <span v-else class="ok-cell">无冲突</span>
          </td>
          <td>{{ row.status }}</td>
          <td class="row-actions">
            <button
              v-for="action in nextActions(row)"
              :key="action"
              class="link"
              type="button"
              @click="runAction(action, row)"
            >
              {{ action }}
            </button>
            <span v-if="nextActions(row).length === 0" class="muted-text">—</span>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="columns.length + 3" class="empty-state">暂无航班保障数据，可先登记航班保障任务</td>
        </tr>
      </tbody>
    </table>

    <footer class="page-foot">
      <span>共 {{ total }} 条航班保障记录</span>
      <span v-if="message" :class="messageOk ? 'ok-text' : 'error-text'">{{ message }}</span>
    </footer>

    <div v-if="creating" class="modal-mask" @click.self="creating = false">
      <form class="modal" @submit.prevent="submitCreate">
        <h3>登记航班保障任务</h3>
        <p class="page-desc">登记时按计划到达时段（到达前30分钟至后90分钟）校验机位与班组占用，冲突会预警并写入机位占用待办。</p>
        <label class="form-item"><span>航班号</span><input v-model="form.航班号" required /></label>
        <label class="form-item"><span>机型</span><input v-model="form.机型" placeholder="A320" /></label>
        <label class="form-item"><span>计划到达</span><input v-model="form.计划到达" placeholder="2026-10-04 14:00" required /></label>
        <label class="form-item"><span>机位号</span><input v-model="form.机位号" placeholder="101" required /></label>
        <label class="form-item">
          <span>保障等级</span>
          <select v-model="form.保障等级" required>
            <option value="">请选择</option>
            <option>要客</option>
            <option>一级</option>
            <option>二级</option>
            <option>三级</option>
          </select>
        </label>
        <label class="form-item">
          <span>保障班组</span>
          <select v-model="form.保障班组" required>
            <option value="">请选择</option>
            <option>甲班</option>
            <option>乙班</option>
            <option>丙班</option>
          </select>
        </label>
        <div class="modal-actions">
          <button class="btn primary" type="submit">登记</button>
          <button class="btn ghost" type="button" @click="creating = false">取消</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import {
  downloadEntries,
  listFlightEntries,
  moduleMeta,
  registerFlight,
  runFlightAction,
} from '@/api/local-service'
import type { EntryRow } from '@/data/types'

const meta = moduleMeta('flight')
const columns = ['保障编号', '航班号', '机型', '计划到达', '机位号', '保障等级', '保障班组']

const rows = ref<EntryRow[]>([])
const total = ref(0)
const message = ref('')
const messageOk = ref(true)
const filters = ref<Record<string, string>>({})
const summary = ref({ total: 0, standSide: 0, teamSide: 0, bothSide: 0 })
const creating = ref(false)
const form = reactive({
  航班号: '',
  机型: '',
  计划到达: '',
  机位号: '',
  保障等级: '',
  保障班组: '',
})

const statusSummary = computed(() =>
  meta.statuses.map((status) => ({
    status,
    count: rows.value.filter((row) => String(row.status) === status).length,
  })),
)

const stats = computed(() => [
  { label: '筛选任务数', value: total.value },
  { label: '保障中任务', value: rows.value.filter((r) => r.status === '保障中').length },
  {
    label: '保障完成率',
    value: `${Math.round(
      (rows.value.filter((r) => r.status === '保障完成').length / Math.max(rows.value.length, 1)) * 100,
    )}%`,
  },
])

// 口径对账：逐行冲突任务数 = 机位占用待办汇总 + 班组在岗冲突汇总 − 两处同撞。
// 机位、班组两处读到的数都来自同一份占用台账，故恒成立；不成立即数据链路出问题。
const consistent = computed(
  () => summary.value.standSide + summary.value.teamSide - summary.value.bothSide === summary.value.total,
)

// 状态只允许 待接收→保障中→保障完成：每行只亮出下一步的动作，从根上不许跳步。
function nextActions(row: EntryRow): string[] {
  if (row.status === '待接收') return ['接收任务']
  if (row.status === '保障中') return ['确认完成']
  return []
}

function resetFilters() {
  filters.value = {}
  reload()
}

function exportRows() {
  downloadEntries(meta.key)
}

function openCreate() {
  message.value = ''
  creating.value = true
}

function submitCreate() {
  const result = registerFlight({ ...form })
  message.value = result.message
  messageOk.value = result.ok
  if (result.ok) {
    creating.value = false
    Object.assign(form, { 航班号: '', 机型: '', 计划到达: '', 机位号: '', 保障等级: '', 保障班组: '' })
  }
  reload()
}

function runAction(action: string, row: EntryRow) {
  const result = runFlightAction(Number(row.id), action)
  message.value = result.message
  messageOk.value = result.ok
  reload()
}

function reload() {
  message.value = ''
  try {
    const payload = listFlightEntries(filters.value)
    rows.value = payload.items
    total.value = payload.total
    summary.value = payload.conflictSummary
  } catch (error) {
    message.value = error instanceof Error ? error.message : '航班保障列表读取失败'
    messageOk.value = false
  }
}

onMounted(reload)
</script>

<style scoped>
.conflict-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}
.conflict-strip .legend-item {
  background: #fef3f2;
  color: #b42318;
  border-radius: 999px;
  padding: 3px 12px;
}
.conflict-strip .legend-item.neutral {
  background: #eef2f7;
  color: var(--muted);
}
.consistency {
  margin-left: auto;
  font-size: 12px;
  color: #b42318;
}
.consistency.ok {
  color: #027a48;
}
tr.conflicted td {
  background: #fff7f6;
}
.conflict-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #b42318;
}
.conflict-cell small {
  color: #7a271a;
  font-weight: normal;
}
.ok-cell {
  color: #027a48;
  font-size: 12px;
}
.ok-text {
  color: #027a48;
}
.muted-text {
  color: var(--muted);
}
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(16, 24, 40, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.modal {
  background: #fff;
  border-radius: 10px;
  padding: 20px 24px;
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.modal h3 {
  margin: 0;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--muted);
}
.form-item input,
.form-item select {
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
}
.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 6px;
}
</style>
