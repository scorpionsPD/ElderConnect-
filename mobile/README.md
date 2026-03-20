# elderconnect_plus

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Auto-increment iOS build number

Use the helper script to automatically bump `pubspec.yaml` build number on each build:

```bash
cd "/Users/pradeepdahiya/Documents/ElderConnect+/mobile"
chmod +x scripts/auto_bump_build.sh
./scripts/auto_bump_build.sh
```

If current version is `1.0.4+63`, running once updates it to `1.0.4+64`, then `1.0.4+65`, and so on.

To bump and immediately build an IPA:

```bash
cd "/Users/pradeepdahiya/Documents/ElderConnect+/mobile"
./scripts/auto_bump_build.sh --build-ipa
```
