<template>
  <section class="page" data-module="flight">
    <header class="page-head">
      <div>
        <h2>航班保障管理</h2>
        <p class="page-desc">值班员先按计划到达与保障等级筛出当天要接的任务，再逐条核机位、班组占用；冲突结果同步回写机位与班组占用待办。</p>
      </div>
      <div class="page-actions">
        <button class="btn primary" type="button" @click="openCreate">登记航班保障任务</button>
        <button class="btn" type="button" @click="recheck">重新校验占用</button>
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

    <form class="filter-bar" @submit.prevent="reload">
      <label class="filter-item">
        <span>计划到达（日期匹配）</span>
        <input v-model="filters['计划到达']" placeholder="如 2026-10-04" />
      </label>
      <label class="filter-item">
        <span>保障等级</span>
        <select v-model="filters['保障等级']">
          <option value="">全部</option>
          <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
        </select>
      </label>
      <label class="filter-item">
        <span>航班号</span>
        <input v-model="filters['航班号']" placeholder="按航班号检索" />
      </label>
      <button class="btn" type="submit">查询</button>
      <button class="btn ghost" type="button" @click="resetFilters">重置条件</button>
    </form>

    <div v-if="report" class="conflict-panel" :class="{ 'has-conflict': report.conflictCount > 0 }">
      <div class="conflict-head">
        <strong>占用校验（计划到达时段：到达起 {{ windowMinutes }} 分钟）</strong>
        <span>
          筛选命中 {{ total }} 条，其中有效任务 {{ report.scanned }} 条，冲突 {{ report.conflictCount }} 条
          ｜机位侧占用待办读到 {{ report.standEvidenceCount }} 条
          ｜班组侧占用待办读到 {{ report.teamEvidenceCount }} 条
        </span>
      </div>
      <ul v-if="report.conflicts.length" class="conflict-list">
        <li v-for="item in report.conflicts" :key="item.flightId" class="conflict-item">
          <span class="conflict-tag" :class="`tag-${item.kind}`">
            {{ item.kind === 'stand' ? '机位冲突' : item.kind === 'team' ? '班组冲突' : '机位+班组双冲突' }}
          </span>
          <span class="conflict-flight">{{ item.flightNo }}（{{ item.arrival }}）</span>
          <span class="conflict-msg">{{ item.message }}</span>
          <span class="conflict-note">主判定：{{ item.primary === 'stand' ? '机位优先' : '仅班组冲突' }}，两证据已成对回写</span>
        </li>
      </ul>
      <p v-else class="conflict-empty">筛选结果内无机位、班组占用冲突。</p>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column">{{ column }}</th>
          <th>当前状态</th>
          <th>占用校验</th>
          <th>可执行动作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="String(row.id)" :class="{ 'row-conflict': Boolean(conflictMap.get(Number(row.id))) }">
          <td v-for="column in columns" :key="column">{{ row[column] ?? '—' }}</td>
          <td>{{ row.status }}</td>
          <td class="conflict-cell">
            <template v-if="conflictMap.get(Number(row.id))">
              <span class="conflict-tag" :class="`tag-${conflictMap.get(Number(row.id))!.kind}`">
                {{ conflictMap.get(Number(row.id))!.kind === 'stand' ? '机位冲突' : conflictMap.get(Number(row.id))!.kind === 'team' ? '班组冲突' : '双冲突' }}
              </span>
              <span class="conflict-msg">{{ conflictMap.get(Number(row.id))!.message }}</span>
            </template>
            <span v-else class="ok-text">空闲可接</span>
          </td>
          <td class="row-actions">
            <button
              v-for="action in actionOf(row)"
              :key="action.name"
              class="link"
              :class="{ disabled: !action.enabled }"
              type="button"
              :title="action.reason"
              @click="action.enabled && runAction(action.name, row)"
            >
              {{ action.name }}
            </button>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="columns.length + 3" class="empty-state">暂无符合条件的航班保障任务，可先登记</td>
        </tr>
      </tbody>
    </table>

    <footer class="page-foot">
      <span>共 {{ total }} 条航班保障记录</span>
      <span v-if="errorMessage" class="error-text">{{ errorMessage }}</span>
    </footer>

    <div v-if="creating" class="modal-mask" @click.self="creating = false">
      <form class="modal-card" @submit.prevent="submitCreate">
        <h3>登记航班保障任务</h3>
        <label class="form-item">
          <span>航班号</span>
          <input v-model="form.航班号" placeholder="如 CA1234" />
        </label>
        <label class="form-item">
          <span>机型</span>
          <input v-model="form.机型" placeholder="如 A320" />
        </label>
        <label class="form-item">
          <span>计划到达（YYYY-MM-DD HH:mm）</span>
          <input v-model="form.计划到达" placeholder="如 2026-10-04 09:30" />
        </label>
        <label class="form-item">
          <span>机位号</span>
          <input v-model="form.机位号" list="stand-options" placeholder="如 101" />
          <datalist id="stand-options">
            <option v-for="stand in standOptions" :key="stand" :value="stand" />
          </datalist>
        </label>
        <label class="form-item">
          <span>保障等级</span>
          <select v-model="form.保障等级">
            <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
          </select>
        </label>
        <label class="form-item">
          <span>保障班组</span>
          <input v-model="form.保障班组" list="team-options" placeholder="如 甲班一组" />
          <datalist id="team-options">
            <option v-for="team in teamOptions" :key="team" :value="team" />
          </datalist>
        </label>
        <p v-if="createMessage" class="form-message" :class="{ 'error-text': !createOk }">{{ createMessage }}</p>
        <div class="modal-actions">
          <button class="btn" type="button" @click="creating = false">取消</button>
          <button class="btn primary" type="submit">登记并校验占用</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import {
  bootstrapOccupancy,
  createFlight,
  downloadEntries,
  flightConflictReport,
  listEntries,
  moduleMeta,
  runAction as applyAction,
} from '@/api/local-service'
import { OCCUPANCY_WINDOW_MINUTES } from '@/data/occupancy'
import { listRows } from '@/data/local-store'
import type { CreateFlightInput, EntryRow, FilterConflictReport } from '@/data/types'

const meta = moduleMeta('flight')
const columns = ["保障编号", "航班号", "机型", "计划到达", "机位号", "保障等级", "保障班组", "保障状态"]
const statuses = ["待接收", "保障中", "保障完成", "已终止"]
const levels = ["普通", "重要", "要客"]
const windowMinutes = OCCUPANCY_WINDOW_MINUTES

const rows = ref<EntryRow[]>([])
const total = ref(0)
const errorMessage = ref('')
const filters = ref<Record<string, string>>({ 计划到达: '', 保障等级: '', 航班号: '' })
const report = ref<FilterConflictReport | null>(null)
const conflictMap = computed(() => new Map((report.value?.conflicts ?? []).map((item) => [item.flightId, item])))

const standOptions = computed(() => listRows('stand').map((row) => String(row['机位编号'] ?? '')).filter(Boolean))
const teamOptions = computed(() => listRows('team').map((row) => String(row['班组名称'] ?? '')).filter(Boolean))

const statusSummary = computed(() =>
  statuses.map((status: string) => ({
    status,
    count: rows.value.filter((row) => String(row.status) === status).length,
  })),
)

const stats = computed(() => {
  const all = listRows('flight')
  const day = filters.value['计划到达']?.trim()
  const todays = day ? all.filter((row) => String(row['计划到达'] ?? '').includes(day)) : all
  const active = todays.filter((row) => String(row.status) === '保障中').length
  const done = todays.filter((row) => String(row.status) === '保障完成').length
  const rate = todays.length ? Math.round((done / todays.length) * 100) : 0
  return [
    { label: day ? `${day} 保障任务` : '全部保障任务', value: todays.length },
    { label: '保障中任务', value: active },
    { label: '保障完成率', value: `${rate}%` },
  ]
})

// 动作必须顺着 待接收 → 保障中 → 保障完成 出现，不允许跳步时按钮置灰。
function actionOf(row: EntryRow): { name: string; enabled: boolean; reason: string }[] {
  const status = String(row.status)
  const hasConflict = Boolean(conflictMap.value.get(Number(row.id)))
  return [
    {
      name: '接收任务',
      enabled: status === '待接收' && !hasConflict,
      reason: status !== '待接收' ? '仅待接收任务可接收' : hasConflict ? '机位或班组时段被占用，先处理冲突' : '接收并登记占用',
    },
    {
      name: '开始保障',
      enabled: status === '保障中',
      reason: status === '保障中' ? '记录实际开工，状态保持保障中' : '需先接收任务进入保障中',
    },
    {
      name: '确认完成',
      enabled: status === '保障中',
      reason: status === '保障中' ? '确认完成并释放机位/班组占用' : '需先在保障中才能完成，不许跳步',
    },
  ]
}

function resetFilters() {
  filters.value = { 计划到达: '', 保障等级: '', 航班号: '' }
  reload()
}

function exportRows() {
  downloadEntries(meta.key)
}

const creating = ref(false)
const createMessage = ref('')
const createOk = ref(true)
const form = reactive<CreateFlightInput>({
  航班号: '',
  机型: '',
  计划到达: '',
  机位号: '',
  保障等级: '普通',
  保障班组: '',
})

function openCreate() {
  createMessage.value = ''
  creating.value = true
}

function submitCreate() {
  createMessage.value = ''
  const result = createFlight({ ...form })
  createOk.value = result.ok
  createMessage.value = result.message
  if (result.ok) {
    Object.assign(form, { 航班号: '', 机型: '', 计划到达: '', 机位号: '', 保障等级: '普通', 保障班组: '' } as CreateFlightInput)
    reload()
    if (!result.conflict) {
      creating.value = false
    }
  }
}

function runAction(action: string, row: EntryRow) {
  errorMessage.value = ''
  const result = applyAction(meta.key, Number(row.id), action)
  errorMessage.value = result.ok ? '' : result.message
  reload()
}

function recheck() {
  bootstrapOccupancy()
  reload()
}

function reload() {
  errorMessage.value = ''
  try {
    const activeFilters = Object.fromEntries(Object.entries(filters.value).filter(([, value]) => value.trim() !== ''))
    const payload = listEntries(meta.key, activeFilters)
    rows.value = payload.items
    total.value = payload.total
    // 顺着列表筛选这条路核冲突：机位、班组两侧读到的条数与筛选冲突条数同源、一致。
    report.value = flightConflictReport(activeFilters)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '航班保障列表读取失败'
  }
}

onMounted(() => {
  bootstrapOccupancy()
  reload()
})
</script>

<style scoped>
.conflict-panel {
  background: #fff;
  border: 1px solid var(--border);
  border-left: 4px solid #b54708;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
}
.conflict-panel.has-conflict { border-left-color: #b42318; }
.conflict-head { display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; font-size: 13px; }
.conflict-head span { color: var(--muted); font-size: 12px; }
.conflict-list { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.conflict-item { font-size: 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.conflict-flight { font-weight: 600; }
.conflict-msg { color: #b42318; }
.conflict-note { color: var(--muted); }
.conflict-empty { margin: 8px 0 0; color: var(--muted); font-size: 12px; }
.conflict-tag { border-radius: 4px; padding: 1px 6px; font-size: 12px; white-space: nowrap; }
.tag-stand { background: #fee4e2; color: #b42318; }
.tag-team { background: #fef0c7; color: #b54708; }
.tag-both { background: #fecd45; color: #7a2e0e; }
.row-conflict { background: #fff7f6; }
.conflict-cell { max-width: 360px; }
.conflict-cell .conflict-msg { display: block; font-size: 12px; }
.ok-text { color: #067647; font-size: 12px; }
.link.disabled { color: #98a2b3; cursor: not-allowed; }
.modal-mask {
  position: fixed; inset: 0; background: rgba(16, 24, 40, 0.45);
  display: flex; align-items: center; justify-content: center; z-index: 20;
}
.modal-card {
  background: #fff; border-radius: 10px; padding: 18px 20px;
  width: 460px; display: flex; flex-direction: column; gap: 10px;
}
.modal-card h3 { margin: 0 0 4px; }
.form-item { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--muted); }
.form-item input, .form-item select { padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; color: #1f2937; }
.form-message { font-size: 12px; margin: 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
</style>
