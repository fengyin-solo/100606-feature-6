/**
 * 测试构建：把测试入口（含数据层与存储层）打成单个 Node CJS，
 * 保证测试里用到的函数共享同一份模块状态（local-store 缓存）。
 * 若安装的 @esbuild/* 平台包与当前系统不一致（例如容器里是另一架构），
 * 可用 ESBUILD_BINARY_PATH 指定本机可用的 esbuild 可执行文件。
 */
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')

function autodetectBinary() {
  if (process.env.ESBUILD_BINARY_PATH && fs.existsSync(process.env.ESBUILD_BINARY_PATH)) {
    return
  }
  const pkgDir = path.join(root, 'node_modules', '@esbuild')
  if (!fs.existsSync(pkgDir)) {
    return
  }
  const wanted = `${process.platform}-${process.arch}`
  const names = fs.readdirSync(pkgDir)
  const exact = names.find((name) => name === wanted || name.startsWith(wanted))
  const ordered = exact ? [exact, ...names.filter((name) => name !== exact)] : names
  for (const name of ordered) {
    const candidate = path.join(pkgDir, name, 'bin', 'esbuild')
    if (fs.existsSync(candidate)) {
      process.env.ESBUILD_BINARY_PATH = candidate
      return
    }
  }
}

async function main() {
  autodetectBinary()
  const esbuild = require('esbuild')
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'test-entry.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: path.join(__dirname, 'build-test', 'test-bundle.cjs'),
    alias: { '@': path.join(root, 'src') },
  })
  console.log('test bundle written to', path.join('test', 'build-test'))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
