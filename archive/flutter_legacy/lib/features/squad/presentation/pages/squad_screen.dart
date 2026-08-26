import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_clipper.dart';
import '../../../../core/widgets/p5_bottom_nav.dart';
import '../providers/squad_provider.dart';
import '../../../dashboard/presentation/widgets/stat_radar_chart.dart';
import '../../../dashboard/domain/logic/xp_engine.dart';
import '../../domain/models/squad_member.dart';

class SquadScreen extends ConsumerStatefulWidget {
  const SquadScreen({super.key});

  @override
  ConsumerState<SquadScreen> createState() => _SquadScreenState();
}

class _SquadScreenState extends ConsumerState<SquadScreen> {
  String? _expandedMemberId;

  @override
  Widget build(BuildContext context) {
    final squadAsync = ref.watch(squadProvider);
    final xpCalculator = ref.watch(xpCalculatorProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            _buildHeader(context),
            const SizedBox(height: 16),
            Expanded(
              child: squadAsync.when(
                data: (squad) => ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  itemCount: squad.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final member = squad[index];
                    final isExpanded = _expandedMemberId == member.id;
                    
                    return _buildSquadCard(context, member, isExpanded, xpCalculator);
                  },
                ),
                loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primaryRed)),
                error: (err, st) => Center(child: Text('Error loading squad', style: TextStyle(color: Colors.white))),
              ),
            ),
            
            // Bottom Navigation
            P5BottomNav(
              currentIndex: 3, // SQUAD is index 3
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            'SQUAD',
            style: Theme.of(context).textTheme.displayMedium?.copyWith(
              color: AppColors.primaryWhite,
              fontWeight: FontWeight.w900,
              fontStyle: FontStyle.italic,
              height: 1.0,
            ),
          ),
          const SizedBox(width: 10),
          Transform(
            transform: Matrix4.skewX(-0.5),
            child: Container(
              height: 8,
              width: 40,
              color: AppColors.primaryRed,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSquadCard(BuildContext context, SquadMember member, bool isExpanded, IXpCalculator xpCalculator) {
    return GestureDetector(
      onTap: () {
        setState(() {
          if (isExpanded) {
            _expandedMemberId = null;
          } else {
            _expandedMemberId = member.id;
          }
        });
      },
      child: Transform(
        transform: Matrix4.skewX(-0.06),
        child: Container(
          decoration: BoxDecoration(
            color: isExpanded ? AppColors.surfaceDark : AppColors.backgroundDark,
            border: Border.all(color: AppColors.primaryRed, width: 2),
            boxShadow: [
              if (!isExpanded)
                const BoxShadow(color: AppColors.primaryRed, offset: Offset(4, 4), blurRadius: 0),
            ],
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        // Status Dot
                        Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: member.isOnline ? Colors.greenAccent : Colors.grey,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Transform(
                            transform: Matrix4.skewX(0.06),
                            child: Text(
                              member.name.toUpperCase(),
                              style: const TextStyle(
                                color: AppColors.primaryWhite,
                                fontWeight: FontWeight.w900,
                                fontStyle: FontStyle.italic,
                                fontSize: 22,
                                letterSpacing: 1.2,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Transform(
                    transform: Matrix4.skewX(0.06),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      color: AppColors.primaryWhite,
                      child: Text(
                        member.role.displayName.toUpperCase(),
                        style: const TextStyle(
                          color: AppColors.backgroundDark,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              if (isExpanded) ...[
                const SizedBox(height: 24),
                Transform(
                  transform: Matrix4.skewX(0.06),
                  child: Center(
                    child: SizedBox(
                      width: 300,
                      height: 260,
                      child: ClipPath(
                        clipper: P5CaseFileClipper(),
                        child: Container(
                          color: AppColors.primaryWhite,
                          padding: const EdgeInsets.all(16),
                          child: StatRadarChart(stats: member.stats, xpCalculator: xpCalculator),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
