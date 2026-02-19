/**
 * macOS notarization script for electron-builder afterSign hook.
 * Requires: APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID env vars.
 *
 * This runs automatically after code signing during `npm run package:mac`.
 * If env vars are not set, notarization is skipped silently.
 */
const { notarize } = require('@electron/notarize')

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') return

  // Skip notarization if credentials are not configured
  if (!process.env.APPLE_ID || !process.env.APPLE_APP_SPECIFIC_PASSWORD) {
    console.log('Skipping notarization: APPLE_ID or APPLE_APP_SPECIFIC_PASSWORD not set')
    return
  }

  const appName = context.packager.appInfo.productFilename

  console.log(`Notarizing ${appName}...`)

  await notarize({
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  })

  console.log('Notarization complete.')
}
