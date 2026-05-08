# Brand Fonts — Placement Required

These fonts are declared in `pubspec.yaml` but the `.ttf` binary files must
be downloaded manually from Google Fonts and placed in this folder.

## Required files

Drop these 8 files in `assets/fonts/`:

```
Poppins-Regular.ttf
Poppins-Medium.ttf
Poppins-SemiBold.ttf
Poppins-Bold.ttf
Inter-Regular.ttf
Inter-Medium.ttf
Inter-SemiBold.ttf
Inter-Bold.ttf
```

## Where to download

- **Poppins:** https://fonts.google.com/specimen/Poppins
- **Inter:** https://fonts.google.com/specimen/Inter

Click "Get font" → "Download all" → unzip → copy the 8 specific weights
above into this folder. Other weights/italics are not needed.

## After placement

Run from the `frontend/` directory:
```
flutter pub get
flutter clean
flutter run -d chrome --dart-define=API_BASE_URL=https://selmapp.com/api
```
