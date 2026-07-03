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

    Future.delayed(const Duration(seconds: 3), () {
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
              children: toasts.map((t) => _buildToast(t)).toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildToast(ToastData toast) {
    return TweenAnimationBuilder<double>(
      key: ValueKey(toast.id),
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOutBack,
      builder: (context, value, child) {
        return Transform.scale(
          scale: value,
          child: Transform.translate(
            offset: Offset(0, -20 * (1 - value)),
            child: child,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        child: Transform(
          transform: Matrix4.skewX(-0.15),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.accentYellow,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.5),
                  offset: const Offset(4, 4),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Transform(
                  transform: Matrix4.skewX(0.15),
                  child: const Icon(Icons.check_circle, color: Colors.black),
                ),
                const SizedBox(width: 12),
                Transform(
                  transform: Matrix4.skewX(0.15),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        toast.title.toUpperCase(),
                        style: const TextStyle(
                          fontStyle: FontStyle.italic,
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                          color: Colors.black,
                        ),
                      ),
                      if (toast.message.isNotEmpty)
                        Text(
                          toast.message.toUpperCase(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                            color: Colors.black87,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
