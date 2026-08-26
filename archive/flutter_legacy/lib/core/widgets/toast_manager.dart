import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:persona_navigator/core/constants/app_colors.dart';

class ToastData {
  final String id;
  final String title;
  final String message;

  ToastData({required this.id, required this.title, required this.message});
}

class ToastNotifier extends Notifier<List<ToastData>> {
  @override
  List<ToastData> build() => [];

  void showToast({required String title, required String message}) {
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    final toast = ToastData(id: id, title: title, message: message);
    state = [...state, toast];

    Future.delayed(const Duration(milliseconds: 1800), () {
      state = state.where((t) => t.id != id).toList();
    });
  }
}

final toastProvider = NotifierProvider<ToastNotifier, List<ToastData>>(() {
  return ToastNotifier();
});

class ToastOverlay extends ConsumerWidget {
  final Widget child;

  const ToastOverlay({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toasts = ref.watch(toastProvider);

    return Stack(
      children: [
        child,
        if (toasts.isNotEmpty)
          Positioned(
            top: 40,
            right: 40,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: toasts.map((t) => _buildToast(context, t)).toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildToast(BuildContext context, ToastData toast) {
    return TweenAnimationBuilder<double>(
      key: ValueKey(toast.id),
      tween: Tween(begin: 1.5, end: 1.0),
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeOutBack,
      builder: (context, value, child) {
        // value goes 1.5 → 1.0; map to opacity 0.0 → 1.0
        final double op = (1.0 - ((value - 1.0) / 0.5)).clamp(0.0, 1.0);
        
        return Opacity(
          opacity: op,
          child: Transform.scale(
            scale: value,
            child: child,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            // Red shadow/underlay
            Positioned(
              top: 4,
              left: -4,
              right: 0,
              bottom: -4,
              child: Transform(
                transform: Matrix4.skewX(-0.14),
                child: Container(color: AppColors.primaryRed),
              ),
            ),
            // Main yellow toast + red suffix block
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Transform(
                  transform: Matrix4.skewX(-0.14),
                  child: Container(
                    color: AppColors.accentYellow,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    child: Transform(
                      transform: Matrix4.skewX(0.14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            toast.title.toUpperCase(),
                            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                              color: Colors.black,
                              fontWeight: FontWeight.w900,
                              fontStyle: FontStyle.italic,
                              fontSize: 24, // Bigger like the design
                            ),
                          ),
                          if (toast.message.isNotEmpty)
                            Text(
                              toast.message.toUpperCase(),
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 14,
                                color: Colors.black87,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
                // Red right side block with slash
                Transform(
                  transform: Matrix4.skewX(-0.14),
                  child: Container(
                    color: AppColors.primaryRed,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Transform(
                      transform: Matrix4.skewX(0.14),
                      child: const Text(
                        '/',
                        style: TextStyle(
                          color: AppColors.primaryWhite,
                          fontWeight: FontWeight.w900,
                          fontStyle: FontStyle.italic,
                          fontSize: 24,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
