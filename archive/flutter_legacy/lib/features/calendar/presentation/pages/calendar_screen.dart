import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_background.dart';
import '../../../../core/widgets/p5_bottom_nav.dart';
import '../../../../core/widgets/p5_clipper.dart';
import '../../../quests/domain/repositories/calendar_repository.dart';
import '../../../quests/domain/models/calendar_event.dart';

class CalendarScreen extends ConsumerWidget {
  const CalendarScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final calendarRepo = ref.watch(calendarRepositoryProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: P5Background(
        child: Column(
          children: [
            const SizedBox(height: 60),
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: ClipPath(
                clipper: P5SlantedClipper(slant: 10.0),
                child: Container(
                  color: AppColors.primaryRed,
                  padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 24.0),
                  child: Center(
                    child: Text(
                      'TODAY\'S EVENTS',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: AppColors.primaryWhite,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Event List
            Expanded(
              child: FutureBuilder<List<CalendarEvent>>(
                future: calendarRepo.getTodayEvents(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(
                      child: CircularProgressIndicator(color: AppColors.primaryRed),
                    );
                  }
                  
                  if (snapshot.hasError) {
                    return Center(
                      child: Text(
                        'Failed to load events.',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: AppColors.primaryWhite,
                        ),
                      ),
                    );
                  }
                  
                  final events = snapshot.data ?? [];
                  
                  if (events.isEmpty) {
                    return Center(
                      child: Text(
                        'No events today.',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: AppColors.primaryWhite,
                        ),
                      ),
                    );
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    itemCount: events.length,
                    itemBuilder: (context, index) {
                      final event = events[index];
                      final startTime = DateFormat('h:mm a').format(event.startTime);
                      final endTime = DateFormat('h:mm a').format(event.endTime);
                      
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: ClipPath(
                          clipper: P5SlantedClipper(slant: -8.0),
                          child: Container(
                            color: AppColors.primaryWhite,
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  event.title,
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    color: AppColors.backgroundDark,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '$startTime - $endTime',
                                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    color: AppColors.primaryRed,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
            
            // Bottom Navigation
            P5BottomNav(
              currentIndex: 1, // Kept 1 because Calendar is under Missions for now
            ),
          ],
        ),
      ),
    );
  }
}
