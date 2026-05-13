#!/usr/bin/env bash
#
# Build a signed Android App Bundle (AAB) for SELM, ready to upload to
# Google Play Console.
#
# What it does:
#   1. Generates an upload keystore the first time you run it (and saves the
#      password into android/keystore.properties so future builds are
#      non-interactive).
#   2. Runs `npm run build` to produce the latest dist/ web bundle.
#   3. Runs `npx cap sync android` to copy dist into the Android project.
#   4. Runs `./gradlew bundleRelease` to produce a signed AAB.
#
# Output:
#   android/app/build/outputs/bundle/release/app-release.aab
#
# Run from the project root:
#   ./scripts/android-release.sh
#
# Notes:
#   - The keystore lives at android/app/selm-release.keystore. Back this file
#     up somewhere safe — losing it means you can never publish updates to
#     this Play Store listing again.
#   - keystore.properties is gitignored. Don't commit it.
#

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

KEYSTORE_DIR="$ROOT/android/app"
KEYSTORE_FILE="$KEYSTORE_DIR/selm-release.keystore"
KEY_ALIAS="selm"
PROPS_FILE="$ROOT/android/keystore.properties"

# Make sure JAVA_HOME is set for keytool / gradle. Honor an existing value if
# the user has one; otherwise try the standard brew openjdk@21 path.
if [ -z "${JAVA_HOME:-}" ]; then
  if [ -d "/opt/homebrew/opt/openjdk@21" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
    export PATH="$JAVA_HOME/bin:$PATH"
  fi
fi

echo "==> Project root: $ROOT"
echo "==> JAVA_HOME:    ${JAVA_HOME:-(unset)}"

# ── 1. Keystore ──────────────────────────────────────────────────────────────
if [ ! -f "$KEYSTORE_FILE" ]; then
  echo
  echo "==> No keystore found at $KEYSTORE_FILE"
  echo "    Generating a new upload keystore (one-time setup)…"

  # Generate a strong random password — saved to keystore.properties below.
  # Use a temp pipefail-safe approach: read 64 random bytes, base64-encode,
  # and trim to 32 alphanumerics. Avoids the SIGPIPE-fails-under-pipefail
  # trap that "tr -dc … | head -c 32" hits when head exits early.
  STORE_PASS="$(head -c 64 /dev/urandom | base64 | LC_ALL=C tr -cd 'A-Za-z0-9' | cut -c1-32)"
  KEY_PASS="$STORE_PASS"

  keytool -genkeypair \
    -keystore "$KEYSTORE_FILE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA -keysize 2048 \
    -validity 10000 \
    -storepass "$STORE_PASS" \
    -keypass "$KEY_PASS" \
    -dname "CN=SELM, OU=Mobile, O=Selm Mobile Application INC., L=Toronto, ST=ON, C=CA"

  cat > "$PROPS_FILE" <<EOF
storeFile=app/selm-release.keystore
storePassword=$STORE_PASS
keyAlias=$KEY_ALIAS
keyPassword=$KEY_PASS
EOF

  chmod 600 "$PROPS_FILE"
  echo "==> Keystore written to: $KEYSTORE_FILE"
  echo "==> Keystore password saved to: $PROPS_FILE  (gitignored, mode 600)"
  echo
  echo "    *** IMPORTANT *** Back up BOTH files somewhere safe (1Password,"
  echo "    encrypted drive, etc). If you lose them you cannot ship updates"
  echo "    to this Play Store listing — Google does not let you re-key."
  echo
else
  echo "==> Reusing existing keystore at $KEYSTORE_FILE"
fi

# ── 2. Web bundle ────────────────────────────────────────────────────────────
echo
echo "==> Building web bundle (npm run build)…"
npm run build

# ── 3. Capacitor sync ────────────────────────────────────────────────────────
echo
echo "==> Syncing Android project (npx cap sync android)…"
npx cap sync android

# ── 4. Gradle bundleRelease ──────────────────────────────────────────────────
echo
echo "==> Building signed AAB (./gradlew bundleRelease)…"
cd "$ROOT/android"
./gradlew bundleRelease

AAB="$ROOT/android/app/build/outputs/bundle/release/app-release.aab"
echo
if [ -f "$AAB" ]; then
  echo "==> SUCCESS. AAB ready at:"
  echo "    $AAB"
  echo
  echo "    Upload it to Google Play Console → SELM → Internal testing →"
  echo "    Create new release → Add app bundle."
else
  echo "==> Build finished but AAB was not found at the expected path:"
  echo "    $AAB"
  echo "    Check the gradle output above for errors."
  exit 1
fi
