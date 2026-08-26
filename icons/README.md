# Persona Navigator — App Icon (concept D)

Square, opaque PNGs (no rounded corners — iOS/macOS mask them automatically). Source vector: `icon-d-pslash.svg`.

## What's here
- `icon-d-pslash.svg` — editable master (vector).
- `export/AppIcon-<px>.png` — flat PNGs at every size (1024 down to 16).
- `AppIcon-iOS.appiconset/` — drop-in Xcode iOS icon set (+ Contents.json).
- `AppIcon-macOS.appiconset/` — drop-in Xcode macOS icon set (+ Contents.json).

---

## Flutter (recommended — one command)
Your stack is Flutter, so the simplest path is `flutter_launcher_icons`, which generates every iOS + macOS size from the 1024 master.

1. Copy `export/AppIcon-1024.png` into your project, e.g. `assets/icon/app_icon.png`.
2. Add to `pubspec.yaml`:
   ```yaml
   dev_dependencies:
     flutter_launcher_icons: ^0.14.1

   flutter_launcher_icons:
     image_path: "assets/icon/app_icon.png"
     ios: true
     macos:
       generate: true
       image_path: "assets/icon/app_icon.png"
   ```
3. Run:
   ```
   flutter pub get
   dart run flutter_launcher_icons
   ```
That writes the icons into `ios/Runner/Assets.xcassets` and `macos/Runner/Assets.xcassets`.

## Native iOS / macOS (manual — use the prebuilt sets)
If you're not using the generator, drop the ready-made sets straight in:

- **iOS:** replace `ios/Runner/Assets.xcassets/AppIcon.appiconset/` with the contents of `AppIcon-iOS.appiconset/` (rename the folder to `AppIcon.appiconset`).
- **macOS:** replace `macos/Runner/Assets.xcassets/AppIcon.appiconset/` with the contents of `AppIcon-macOS.appiconset/`.

Then in Xcode, Target → General → App Icons, confirm the icon set is selected. Clean build folder (⇧⌘K) and rebuild.

## React Native / other
Use `export/AppIcon-1024.png` with a tool like `@bam.tech/react-native-make` (`npx react-native set-icon --path AppIcon-1024.png`), or drop the `.appiconset` folders into the native iOS/macOS projects as above.

## Notes
- Icons are fully opaque with no alpha — required for iOS App Store submission.
- To tweak the art (colors, star, slash angle), edit `icon-d-pslash.svg` and re-export at 1024, then re-run the generator.
