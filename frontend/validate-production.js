#!/usr/bin/env node

/**
 * QR Health Frontend - Production Validation Script
 * Runs automated validation checks before deployment
 * 
 * Usage:
 *   node validate-production.js
 * 
 * Or in browser console:
 *   - Copy entire E2E_CONSOLE_TESTER.js and paste
 *   - Run: QRHealthTester.runAllTests()
 */

let chalk;
try {
  chalk = require('chalk');
} catch (e) {
  // chalk not found, will use internal colors
}

// Color utilities (fallback if chalk not available)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Validation Suite
class ProductionValidator {
  constructor() {
    this.checks = []
    this.passed = 0
    this.failed = 0
  }

  async run() {
    console.clear()
    log('=' * 60, 'blue')
    log('🚀 QR HEALTH FRONTEND - PRODUCTION VALIDATION', 'cyan')
    log('=' * 60, 'blue')
    log('')

    // Run all validation checks
    await this.checkEnvironment()
    await this.checkBuild()
    await this.checkDependencies()
    await this.checkConfiguration()
    this.generateReport()
  }

  async checkEnvironment() {
    log('\n📋 ENVIRONMENT VALIDATION', 'blue')
    log('-' * 40)

    // Check Node version
    const nodeVersion = process.version.match(/(\d+\.\d+)/)[0]
    const nodeOk = parseFloat(nodeVersion) >= 18
    this.addCheck('Node.js 18+', nodeOk, `v${nodeVersion}`)

    // Check npm
    const fs = require('fs')
    const packageJsonExists = fs.existsSync('./package.json')
    this.addCheck('package.json exists', packageJsonExists)

    // Check .env.local
    const envExists = fs.existsSync('./.env.local')
    const envExampleExists = fs.existsSync('./.env.example')
    this.addCheck('.env.local configured', envExists, envExampleExists ? 'use .env.example as template' : '')

    // Check node_modules
    const nodeModulesExists = fs.existsSync('./node_modules')
    this.addCheck('node_modules installed', nodeModulesExists)
  }

  async checkBuild() {
    log('\n🏗️  BUILD VALIDATION', 'blue')
    log('-' * 40)

    const fs = require('fs')

    // Check for source files
    const srcExists = fs.existsSync('./src')
    this.addCheck('src/ directory exists', srcExists)

    // Check for critical files
    const files = [
      { name: 'package.json', path: './package.json' },
      { name: 'next.config.ts', path: './next.config.ts' },
      { name: 'tsconfig.json', path: './tsconfig.json' },
    ]

    files.forEach((file) => {
      const exists = fs.existsSync(file.path)
      this.addCheck(`${file.name}`, exists)
    })
  }

  async checkDependencies() {
    log('\n📦 DEPENDENCIES VALIDATION', 'blue')
    log('-' * 40)

    try {
      const packageJson = require('./package.json')
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

      const required = ['next', 'react', 'typescript', 'tailwindcss']
      required.forEach((dep) => {
        const hasLib = !!deps[dep]
        this.addCheck(`${dep}`, hasLib, hasLib ? deps[dep] : 'MISSING')
      })
    } catch (e) {
      this.addCheck('Read package.json', false, e.message)
    }
  }

  async checkConfiguration() {
    log('\n⚙️  CONFIGURATION VALIDATION', 'blue')
    log('-' * 40)

    const fs = require('fs')

    // Check environment variables
    if (fs.existsSync('./.env.local')) {
      const env = fs.readFileSync('./.env.local', 'utf-8')
      const vars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_API_URL']
      vars.forEach((v) => {
        const hasVar = env.includes(v)
        this.addCheck(`${v}`, hasVar, hasVar ? '✓' : 'Add to .env.local')
      })
    } else {
      this.addCheck('Environment variables', false, 'Create .env.local')
    }
  }

  addCheck(name, passed, details = '') {
    const icon = passed ? '✓' : '✗'
    const color = passed ? 'green' : 'red'
    const detailsStr = details ? ` (${details})` : ''
    log(`  ${icon} ${name}${detailsStr}`, color)

    this.checks.push({ name, passed, details })
    if (passed) this.passed++
    else this.failed++
  }

  generateReport() {
    const total = this.checks.length
    const percentage = Math.round((this.passed / total) * 100)

    log('\n' + '=' * 60, 'blue')
    log('📊 VALIDATION REPORT', 'cyan')
    log('=' * 60, 'blue')

    log(`\n✓ Passed:  ${this.passed}/${total}`)
    log(`✗ Failed:  ${this.failed}/${total}`)
    log(`Score:     ${percentage}%\n`)

    if (percentage >= 90) {
      log('✅ READY FOR PRODUCTION', 'green')
      log('\nNext steps:', 'cyan')
      log('  1. Run: npm run build', 'cyan')
      log('  2. Run: npm start', 'cyan')
      log('  3. Open browser console (F12)', 'cyan')
      log('  4. Run: QRHealthTester.runAllTests()', 'cyan')
      log('  5. Deploy when tests pass', 'cyan')
    } else if (percentage >= 70) {
      log('⚠️  NEEDS ATTENTION', 'yellow')
      log('\nFix failed items and re-run validation', 'yellow')
    } else {
      log('❌ NOT READY FOR PRODUCTION', 'red')
      log('\nMany issues need to be fixed before deployment', 'red')
    }

    log('\n' + '=' * 60, 'blue')
  }
}

// Run validation
; (async () => {
  const validator = new ProductionValidator()
  await validator.run()
})()
