import 'package:flutter/material.dart';
import 'package:persona_navigator/core/constants/app_colors.dart';
import 'package:go_router/go_router.dart';
import '../../../../features/chat/presentation/pages/chat_screen.dart';

class DesktopLayout extends StatefulWidget {
  final Widget child;

  const DesktopLayout({super.key, required this.child});

  @override
  State<DesktopLayout> createState() => _DesktopLayoutState();
}

class _DesktopLayoutState extends State<DesktopLayout> {
  bool _isChatOpen = true;

  void _toggleChat() {
    setState(() {
      _isChatOpen = !_isChatOpen;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBlack,
      body: Row(
        children: [
          // Left Sidebar
          Container(
            width: 210,
            decoration: const BoxDecoration(
              color: Color(0xFF0A0A0A),
              border: Border(right: BorderSide(color: Color(0xFF1E1E1E))),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14.0),
                  child: Row(
                    children: [
                      Transform(
                        transform: Matrix4.skewX(-0.15),
                        child: Container(
                          width: 40,
                          height: 40,
                          color: AppColors.primaryRed,
                          alignment: Alignment.center,
                          child: const Text(
                            'V',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'VESPER\nNAVIGATOR',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
                _SidebarItem(
                  title: 'STATUS',
                  onTap: () => context.go('/home'),
                ),
                _SidebarItem(
                  title: 'MISSIONS',
                  onTap: () => context.go('/missions'),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.all(14.0),
                  child: Transform(
                    transform: Matrix4.skewX(-0.1),
                    child: Container(
                      color: AppColors.primaryRed,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      alignment: Alignment.center,
                      child: const Text(
                        'QUICK LOG',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontStyle: FontStyle.italic,
                          fontSize: 14,
                          letterSpacing: 2,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Center Content
          Expanded(
            child: Container(
              color: AppColors.backgroundDark,
              child: widget.child,
            ),
          ),

          // Right Chat Dock
          ClipRect(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: _isChatOpen ? 340 : 46,
              decoration: const BoxDecoration(
                color: Color(0xFF0A0A0A),
                border: Border(left: BorderSide(color: Color(0xFF1E1E1E))),
              ),
              child: _isChatOpen 
                  ? Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  'MORGANA',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 18,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.arrow_forward_ios, color: AppColors.primaryRed),
                                onPressed: _toggleChat,
                              ),
                            ],
                          ),
                        ),
                        // Chat Integration
                        const Expanded(
                          child: ChatScreen(),
                        ),
                      ],
                    )
                  : Column(
                      children: [
                        const SizedBox(height: 16),
                        IconButton(
                          icon: const Icon(Icons.arrow_back_ios, color: AppColors.primaryRed),
                          onPressed: _toggleChat,
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final String title;
  final VoidCallback onTap;

  const _SidebarItem({required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 4.0),
        child: Transform(
          transform: Matrix4.skewX(-0.1),
          child: Container(
            color: const Color(0xFF1E1E1E),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontStyle: FontStyle.italic,
                fontSize: 15,
                letterSpacing: 2,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
