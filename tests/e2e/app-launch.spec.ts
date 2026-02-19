import { test, expect } from '@playwright/test'
import { _electron as electron } from '@playwright/test'
import { resolve } from 'path'

test.describe('App Launch', () => {
  test('should launch the app and show the login page', async () => {
    const electronApp = await electron.launch({
      args: [resolve(__dirname, '../../out/main/index.js')],
    })

    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')

    // The app should show either login page or dashboard
    const title = await window.title()
    expect(title).toBeTruthy()

    // Verify the window is visible
    const isVisible = await window.isVisible()
    expect(isVisible).toBe(true)

    await electronApp.close()
  })

  test('should have correct window dimensions', async () => {
    const electronApp = await electron.launch({
      args: [resolve(__dirname, '../../out/main/index.js')],
    })

    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')

    const size = await window.evaluate(() => ({
      width: window.outerWidth,
      height: window.outerHeight,
    }))

    // Min dimensions from windows.ts: 800x600
    expect(size.width).toBeGreaterThanOrEqual(800)
    expect(size.height).toBeGreaterThanOrEqual(600)

    await electronApp.close()
  })
})
