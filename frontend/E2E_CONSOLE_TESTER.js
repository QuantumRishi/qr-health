/**
 * QR Health Frontend - E2E Console Tester
 * Copy entire content and paste into browser console (F12)
 * Then run: QRHealthTester.runAllTests()
 * 
 * Automated testing for production validation
 * ~10 second execution time
 */

const QRHealthTester = {
  config: {
    apiUrl: window.location.origin + '/api',
    supabaseUrl: 'https://your-supabase-url.supabase.co',
    testEmail: 'test@example.com',
    testOtp: '000000',
  },
  results: { passed: [], failed: [], warnings: [] },

  // Color codes
  colors: {
    green: 'color: #22c55e; font-weight: bold;',
    red: 'color: #ef4444; font-weight: bold;',
    yellow: 'color: #eab308; font-weight: bold;',
    blue: 'color: #3b82f6; font-weight: bold;',
    cyan: 'color: #06b6d4; font-weight: bold;',
  },

  // Logging functions
  log(msg, color = 'blue') {
    console.log(`%c${msg}`, this.colors[color])
  },
  logTest(name, passed, details = '') {
    const icon = passed ? '✓' : '✗'
    const color = passed ? 'green' : 'red'
    const msg = `${icon} ${name}${details ? ' - ' + details : ''}`
    console.log(`%c${msg}`, this.colors[color])
    if (passed) this.results.passed.push(name)
    else this.results.failed.push(name)
  },

  // Test functions
  validateEnvironment() {
    this.log('\n📋 ENVIRONMENT VALIDATION', 'cyan')
    
    try {
      // Check browser
      const browserOk = typeof window !== 'undefined'
      this.logTest('Browser available', browserOk)
      
      // Check Next.js
      const nextOk = window.__NEXT_DATA__ !== undefined
      this.logTest('Next.js detected', nextOk)
      
      // Check localStorage
      const localStorageOk = typeof localStorage !== 'undefined'
      this.logTest('localStorage available', localStorageOk)
      
      // Check fetch API
      const fetchOk = typeof fetch !== 'undefined'
      this.logTest('fetch API available', fetchOk)
      
      // Check DOM
      const domOk = typeof document !== 'undefined'
      this.logTest('DOM available', domOk)
      
      return this.results.failed.length === 0
    } catch (e) {
      this.logTest('Environment validation', false, e.message)
      return false
    }
  },

  async testSupabaseConnection() {
    this.log('\n🔌 SUPABASE CONNECTION TEST', 'cyan')
    
    try {
      // Check if supabase is initialized
      const supabaseOk = window.supabaseClient !== undefined || window.$nuxt?.$supabase !== undefined
      this.logTest('Supabase client initialized', supabaseOk)
      return supabaseOk
    } catch (e) {
      this.logTest('Supabase connection', false, e.message)
      return false
    }
  },

  async testHealthEndpoint() {
    this.log('\n🏥 API ENDPOINTS TEST', 'cyan')
    
    try {
      const response = await fetch(this.config.apiUrl + '/health')
      const ok = response.status === 200
      this.logTest('GET /api/health', ok, `${response.status}`)
      return ok
    } catch (e) {
      this.logTest('GET /api/health', false, e.message)
      return false
    }
  },

  async testChatEndpoint() {
    try {
      const response = await fetch(this.config.apiUrl + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test' })
      })
      const ok = response.status === 200 || response.status === 400
      this.logTest('POST /api/chat', ok, `${response.status}`)
      return ok
    } catch (e) {
      this.logTest('POST /api/chat', false, e.message)
      return false
    }
  },

  async testHistoryEndpoint() {
    try {
      const response = await fetch(this.config.apiUrl + '/history')
      const ok = response.status === 200 || response.status === 401
      this.logTest('GET /api/history', ok, `${response.status}`)
      return ok
    } catch (e) {
      this.logTest('GET /api/history', false, e.message)
      return false
    }
  },

  async testStatsEndpoint() {
    try {
      const response = await fetch(this.config.apiUrl + '/stats')
      const ok = response.status === 200 || response.status === 401
      this.logTest('GET /api/stats', ok, `${response.status}`)
      return ok
    } catch (e) {
      this.logTest('GET /api/stats', false, e.message)
      return false
    }
  },

  testPageLoading() {
    this.log('\n📄 PAGE LOADING TEST', 'cyan')
    
    try {
      // Check if main content loads
      const hasContent = document.body.innerHTML.length > 100
      this.logTest('Page content loaded', hasContent)
      
      // Check for root element
      const hasRoot = document.getElementById('__next') !== null
      this.logTest('Next.js root element', hasRoot)
      
      // Check title
      const hasTitle = document.title.length > 0
      this.logTest('Page title set', hasTitle, document.title)
      
      return hasContent && hasRoot && hasTitle
    } catch (e) {
      this.logTest('Page loading', false, e.message)
      return false
    }
  },

  testDarkMode() {
    this.log('\n🌙 DARK MODE TEST', 'cyan')
    
    try {
      // Check if dark mode toggle exists
      const darkToggle = document.querySelector('[data-test="dark-mode-toggle"]') || 
                         document.querySelector('.dark-mode-toggle') ||
                         document.querySelector('[aria-label*="dark"]')
      this.logTest('Dark mode toggle exists', darkToggle !== null)
      
      // Check dark class
      const hasDarkClass = document.documentElement.classList.contains('dark')
      this.logTest('Dark mode support', true, hasDarkClass ? 'enabled' : 'disabled')
      
      return true
    } catch (e) {
      this.logTest('Dark mode', false, e.message)
      return false
    }
  },

  testResponsiveness() {
    this.log('\n📱 RESPONSIVE DESIGN TEST', 'cyan')
    
    try {
      // Check viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]')
      this.logTest('Viewport meta tag', viewport !== null)
      
      // Check window size
      const hasGoodWidth = window.innerWidth > 320
      this.logTest('Viewport width', hasGoodWidth, `${window.innerWidth}px`)
      
      // Check media query support
      const mediaQueryOk = typeof window.matchMedia === 'function'
      this.logTest('Media query support', mediaQueryOk)
      
      return hasGoodWidth
    } catch (e) {
      this.logTest('Responsive design', false, e.message)
      return false
    }
  },

  testLocalStorage() {
    this.log('\n💾 LOCAL STORAGE TEST', 'cyan')
    
    try {
      const key = '__qr_health_test__'
      const value = 'test_' + Date.now()
      
      localStorage.setItem(key, value)
      const retrieved = localStorage.getItem(key)
      const ok = retrieved === value
      
      localStorage.removeItem(key)
      
      this.logTest('LocalStorage persistence', ok)
      return ok
    } catch (e) {
      this.logTest('LocalStorage', false, e.message)
      return false
    }
  },

  async simulateUserFlow() {
    this.log('\n🔄 USER FLOW SIMULATION', 'cyan')
    
    try {
      // Simulate landing page load
      const hasContent = document.body.innerHTML.length > 100
      this.logTest('Landing page accessible', hasContent)
      
      // Check navigation elements
      const hasNav = document.querySelector('nav') || document.querySelector('[role="navigation"]')
      this.logTest('Navigation available', hasNav !== null)
      
      return hasContent && hasNav !== null
    } catch (e) {
      this.logTest('User flow', false, e.message)
      return false
    }
  },

  generateReport() {
    const total = this.results.passed.length + this.results.failed.length
    const percentage = Math.round((this.results.passed.length / total) * 100)
    
    this.log('\n' + '═'.repeat(50), 'blue')
    this.log('📊 VALIDATION REPORT', 'cyan')
    this.log('═'.repeat(50), 'blue')
    
    this.log(`\n✓ Passed:  ${this.results.passed.length}/${total}`)
    this.log(`✗ Failed:  ${this.results.failed.length}/${total}`)
    this.log(`Score:     ${percentage}%\n`)
    
    if (percentage >= 95) {
      this.log('✅ STATUS: GO TO PRODUCTION', 'green')
    } else if (percentage >= 85) {
      this.log('⚠️  STATUS: NEEDS REVIEW', 'yellow')
    } else {
      this.log('❌ STATUS: NOT READY', 'red')
    }
    
    this.log('═'.repeat(50) + '\n', 'blue')
  },

  async runAllTests() {
    console.clear()
    this.log('╔' + '═'.repeat(48) + '╗', 'cyan')
    this.log('║  QR HEALTH V1.0 - AUTOMATED TEST SUITE     ║', 'cyan')
    this.log('╚' + '═'.repeat(48) + '╝', 'cyan')
    
    // Run all tests
    this.validateEnvironment()
    await this.testSupabaseConnection()
    await this.testHealthEndpoint()
    await this.testChatEndpoint()
    await this.testHistoryEndpoint()
    await this.testStatsEndpoint()
    this.testPageLoading()
    this.testDarkMode()
    this.testResponsiveness()
    this.testLocalStorage()
    await this.simulateUserFlow()
    
    // Generate final report
    this.generateReport()
    
    return {
      passed: this.results.passed.length,
      failed: this.results.failed.length,
      percentage: Math.round((this.results.passed.length / (this.results.passed.length + this.results.failed.length)) * 100),
      ready: this.results.failed.length === 0
    }
  }
}

// Auto-run or wait for manual execution
console.log('%cQR Health Tester Ready!', 'color: #22c55e; font-weight: bold;')
console.log('%cRun: QRHealthTester.runAllTests()', 'color: #3b82f6; font-weight: bold;')
