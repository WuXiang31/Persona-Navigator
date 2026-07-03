import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/p5_clipper.dart';
import '../../../../core/widgets/p5_background.dart';
import '../../domain/models/quest_model.dart';
import '../../domain/models/weather_condition.dart';
import '../widgets/quest_card.dart';
import '../../../dashboard/presentation/providers/dashboard_provider.dart';
import '../../../dashboard/domain/logic/xp_engine.dart';
import '../providers/quests_provider.dart';
import '../../../chat/domain/services/chat_service.dart';

class MissionsScreen extends ConsumerStatefulWidget {
  const MissionsScreen({super.key});

  @override
  ConsumerState<MissionsScreen> createState() => _MissionsScreenState();
}

class _MissionsScreenState extends ConsumerState<MissionsScreen> {
  bool _isSelectMode = false;
  final Set<String> _selectedIds = {};

  void _toggleSelectMode() {
    setState(() {
      _isSelectMode = !_isSelectMode;
      if (!_isSelectMode) _selectedIds.clear();
    });
  }

  void _deleteSelected() {
    if (_selectedIds.isEmpty) return;
    showDialog(
      context: context,
      builder: (ctx) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: Transform(
            transform: Matrix4.skewX(-0.14),
            child: Container(
              color: AppColors.backgroundDark,
              padding: const EdgeInsets.all(24.0),
              child: Transform(
                transform: Matrix4.skewX(0.14),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'DELETE ${_selectedIds.length} MISSION${_selectedIds.length > 1 ? 'S' : ''}?',
                      style: Theme.of(ctx).textTheme.displaySmall?.copyWith(
                        color: Colors.red,
                        fontWeight: FontWeight.w900,
                        fontStyle: FontStyle.italic,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Selected missions will be permanently removed.',
                      style: TextStyle(color: AppColors.primaryWhite, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () => Navigator.of(ctx).pop(),
                          child: const Text('CANCEL', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            foregroundColor: AppColors.primaryWhite,
                            shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                          ),
                          onPressed: () {
                            for (final id in _selectedIds) {
                              ref.read(questsProvider.notifier).deleteQuest(id);
                            }
                            Navigator.of(ctx).pop();
                            setState(() {
                              _selectedIds.clear();
                              _isSelectMode = false;
                            });
                          },
                          child: const Text('DELETE ALL', style: TextStyle(fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(dashboardProvider);
    final questsState = ref.watch(questsProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: P5Background(
        child: Column(
          children: [
            // Top Bar / Weather Banner
            _buildWeatherBanner(context, questsState),
            
            // Title row with select mode toggle
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        _isSelectMode ? '${_selectedIds.length} SELECTED' : 'MISSIONS',
                        style: Theme.of(context).textTheme.displayMedium?.copyWith(
                          color: _isSelectMode ? AppColors.accentYellow : AppColors.primaryWhite,
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
                  Row(
                    children: [
                      if (_isSelectMode && _selectedIds.isNotEmpty)
                        IconButton(
                          icon: const Icon(Icons.delete_sweep, color: Colors.red, size: 28),
                          onPressed: _deleteSelected,
                          tooltip: 'Delete selected',
                        ),
                      IconButton(
                        icon: Icon(
                          _isSelectMode ? Icons.close : Icons.checklist,
                          color: _isSelectMode ? AppColors.accentYellow : AppColors.primaryWhite,
                          size: 28,
                        ),
                        onPressed: _toggleSelectMode,
                        tooltip: _isSelectMode ? 'Cancel' : 'Select missions',
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            // Quest List
            Expanded(
              child: questsState.isLoading 
                ? const Center(child: CircularProgressIndicator(color: AppColors.primaryRed))
                : ListView.builder(
                    padding: const EdgeInsets.only(bottom: 100),
                    itemCount: questsState.activeQuests.length,
                    itemBuilder: (context, index) {
                      final quest = questsState.activeQuests[index];
                      // Find current XP for this stat
                      int currentXp = 0;
                      switch (quest.targetStat) {
                        case StatType.knowledge:
                          currentXp = dashboardState.stats.knowledgeXp;
                          break;
                        case StatType.guts:
                          currentXp = dashboardState.stats.gutsXp;
                          break;
                        case StatType.proficiency:
                          currentXp = dashboardState.stats.proficiencyXp;
                          break;
                        case StatType.kindness:
                          currentXp = dashboardState.stats.kindnessXp;
                          break;
                        case StatType.charm:
                          currentXp = dashboardState.stats.charmXp;
                          break;
                      }

                      return QuestCard(
                        quest: quest,
                        currentXpForStat: currentXp,
                        xpCalculator: ref.watch(xpCalculatorProvider),
                        onComplete: () {
                          ref.read(questsProvider.notifier).completeQuest(quest.id);
                        },
                        onTap: () => _showEditQuestDialog(context, quest),
                        isSelectMode: _isSelectMode,
                        isSelected: _selectedIds.contains(quest.id),
                        onSelectedChanged: (selected) {
                          setState(() {
                            if (selected == true) {
                              _selectedIds.add(quest.id);
                            } else {
                              _selectedIds.remove(quest.id);
                            }
                          });
                        },
                      );
                    },
                  ),
            ),
          ],
        ),
      ),
      floatingActionButton: _isSelectMode
          ? null  // Hide FABs in select mode
          : Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                FloatingActionButton(
                  heroTag: 'back_btn',
                  backgroundColor: AppColors.primaryWhite,
                  child: const Icon(Icons.arrow_back, color: AppColors.backgroundDark),
                  onPressed: () => Navigator.of(context).pop(),
                ),
                const SizedBox(width: 16),
                FloatingActionButton(
                  heroTag: 'add_quest_btn',
                  backgroundColor: AppColors.primaryRed,
                  child: const Icon(Icons.add, color: AppColors.primaryWhite),
                  onPressed: () => _showAddQuestDialog(context, ref),
                ),
              ],
            ),
    );
  }

  Widget _buildWeatherBanner(BuildContext context, QuestsState state) {
    Color bannerColor;
    if (state.weather == WeatherCondition.clear) bannerColor = AppColors.primaryRed;
    else if (state.weather == WeatherCondition.thunderstorm) bannerColor = Colors.deepPurple;
    else if (state.weather == WeatherCondition.snowy) bannerColor = Colors.lightBlue;
    else bannerColor = AppColors.primaryWhite.withOpacity(0.9);

    final textColor = (bannerColor == AppColors.primaryRed || bannerColor == Colors.deepPurple) 
        ? AppColors.primaryWhite 
        : AppColors.backgroundDark;

    return Padding(
      padding: const EdgeInsets.only(top: 60.0, left: 16, right: 16),
      child: Transform(
        transform: Matrix4.skewX(-0.14),
        child: Container(
          width: double.infinity,
          color: bannerColor,
          padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 24.0),
          child: Transform(
            transform: Matrix4.skewX(0.14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  state.isLoading ? 'FETCHING WEATHER...' : 'CONDITION: ${state.weather.displayName}',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: textColor,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                    letterSpacing: 2.0,
                  ),
                ),
                if (!state.isLoading)
                  Text(
                    state.weather.statBonusDisplay,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: textColor,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showEditQuestDialog(BuildContext context, Quest quest) {
    String title = quest.title;
    StatType selectedStat = quest.targetStat;
    TimeSlot selectedTimeSlot = quest.timeSlot;
    double xpValue = quest.xpReward.toDouble();
    final titleController = TextEditingController(text: quest.title);

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Dialog(
              backgroundColor: Colors.transparent,
              child: Transform(
                transform: Matrix4.skewX(-0.14),
                child: Container(
                  color: AppColors.backgroundDark,
                  padding: const EdgeInsets.all(24.0),
                  child: Transform(
                    transform: Matrix4.skewX(0.14),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'EDIT MISSION',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: AppColors.primaryRed,
                            fontWeight: FontWeight.w900,
                            fontStyle: FontStyle.italic,
                            letterSpacing: 2.0,
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: titleController,
                          style: const TextStyle(color: AppColors.primaryWhite),
                          decoration: const InputDecoration(
                            labelText: 'Mission Title',
                            labelStyle: TextStyle(color: Colors.grey),
                            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed)),
                            focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed, width: 2)),
                          ),
                          onChanged: (value) => title = value,
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<TimeSlot>(
                          value: selectedTimeSlot,
                          dropdownColor: AppColors.backgroundDark,
                          style: const TextStyle(color: AppColors.primaryWhite),
                          decoration: const InputDecoration(
                            labelText: 'Time of Day',
                            labelStyle: TextStyle(color: Colors.grey),
                            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed)),
                          ),
                          items: TimeSlot.values.map((slot) {
                            return DropdownMenuItem(
                              value: slot,
                              child: Text(slot.name.toUpperCase()),
                            );
                          }).toList(),
                          onChanged: (value) {
                            if (value != null) setState(() => selectedTimeSlot = value);
                          },
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<StatType>(
                          value: selectedStat,
                          dropdownColor: AppColors.backgroundDark,
                          style: const TextStyle(color: AppColors.primaryWhite),
                          decoration: const InputDecoration(
                            labelText: 'Target Stat',
                            labelStyle: TextStyle(color: Colors.grey),
                            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed)),
                          ),
                          items: StatType.values.map((stat) {
                            return DropdownMenuItem(
                              value: stat,
                              child: Text(stat.name.toUpperCase()),
                            );
                          }).toList(),
                          onChanged: (value) {
                            if (value != null) setState(() => selectedStat = value);
                          },
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            const Text('XP Reward:', style: TextStyle(color: Colors.grey)),
                            Expanded(
                              child: Slider(
                                value: xpValue,
                                min: 10,
                                max: 100,
                                divisions: 90,
                                activeColor: AppColors.primaryRed,
                                inactiveColor: Colors.grey,
                                label: xpValue.round().toString(),
                                onChanged: (val) {
                                  setState(() {
                                    xpValue = val;
                                  });
                                },
                              ),
                            ),
                            Text('${xpValue.round()}', style: const TextStyle(color: AppColors.primaryWhite)),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            TextButton.icon(
                              onPressed: () {
                                Navigator.of(context).pop();
                                _showDeleteConfirmation(quest);
                              },
                              icon: const Icon(Icons.delete, color: Colors.red, size: 18),
                              label: const Text('DELETE', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                            ),
                            Row(
                              children: [
                                TextButton(
                                  onPressed: () => Navigator.of(context).pop(),
                                  child: const Text('CANCEL', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(width: 8),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primaryRed,
                                    foregroundColor: AppColors.primaryWhite,
                                    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                                  ),
                                  onPressed: () {
                                    if (title.isNotEmpty) {
                                      ref.read(questsProvider.notifier).updateQuest(
                                        quest.id,
                                        title: title,
                                        targetStat: selectedStat,
                                        timeSlot: selectedTimeSlot,
                                        xpReward: xpValue.round(),
                                      );
                                      Navigator.of(context).pop();
                                    }
                                  },
                                  child: const Text('UPDATE', style: TextStyle(fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showAddQuestDialog(BuildContext context, WidgetRef ref) {
    String title = '';
    StatType selectedStat = StatType.knowledge;
    TimeSlot selectedTimeSlot = TimeSlot.morning;
    bool isAutoMode = true;
    double xpValue = 50;
    bool isLoadingAuto = false;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Dialog(
              backgroundColor: Colors.transparent,
              child: Transform(
                transform: Matrix4.skewX(-0.14),
                child: Container(
                  color: AppColors.backgroundDark,
                  padding: const EdgeInsets.all(24.0),
                  child: Transform(
                    transform: Matrix4.skewX(0.14),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'NEW MISSION',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: AppColors.primaryRed,
                            fontWeight: FontWeight.w900,
                            fontStyle: FontStyle.italic,
                            letterSpacing: 2.0,
                          ),
                        ),
                        const SizedBox(height: 16),
                        SegmentedButton<bool>(
                          segments: const [
                            ButtonSegment(value: true, label: Text('Auto-Decide', style: TextStyle(fontWeight: FontWeight.bold))),
                            ButtonSegment(value: false, label: Text('Manual', style: TextStyle(fontWeight: FontWeight.bold))),
                          ],
                          selected: {isAutoMode},
                          onSelectionChanged: (Set<bool> newSelection) {
                            setState(() {
                              isAutoMode = newSelection.first;
                            });
                          },
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          style: const TextStyle(color: AppColors.primaryWhite),
                          decoration: const InputDecoration(
                            labelText: 'Mission Title',
                            labelStyle: TextStyle(color: Colors.grey),
                            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed)),
                            focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed, width: 2)),
                          ),
                          onChanged: (value) => title = value,
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<TimeSlot>(
                          value: selectedTimeSlot,
                          dropdownColor: AppColors.backgroundDark,
                          style: const TextStyle(color: AppColors.primaryWhite),
                          decoration: const InputDecoration(
                            labelText: 'Time of Day',
                            labelStyle: TextStyle(color: Colors.grey),
                            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed)),
                          ),
                          items: TimeSlot.values.map((slot) {
                            return DropdownMenuItem(
                              value: slot,
                              child: Text(slot.name.toUpperCase()),
                            );
                          }).toList(),
                          onChanged: (value) {
                            if (value != null) setState(() => selectedTimeSlot = value);
                          },
                        ),
                        if (!isAutoMode) ...[
                          const SizedBox(height: 16),
                          DropdownButtonFormField<StatType>(
                            value: selectedStat,
                            dropdownColor: AppColors.backgroundDark,
                            style: const TextStyle(color: AppColors.primaryWhite),
                            decoration: const InputDecoration(
                              labelText: 'Target Stat',
                              labelStyle: TextStyle(color: Colors.grey),
                              enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primaryRed)),
                            ),
                            items: StatType.values.map((stat) {
                              return DropdownMenuItem(
                                value: stat,
                                child: Text(stat.name.toUpperCase()),
                              );
                            }).toList(),
                            onChanged: (value) {
                              if (value != null) setState(() => selectedStat = value);
                            },
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              const Text('XP Reward:', style: TextStyle(color: Colors.grey)),
                              Expanded(
                                child: Slider(
                                  value: xpValue,
                                  min: 10,
                                  max: 100,
                                  divisions: 90,
                                  activeColor: AppColors.primaryRed,
                                  inactiveColor: Colors.grey,
                                  label: xpValue.round().toString(),
                                  onChanged: (val) {
                                    setState(() {
                                      xpValue = val;
                                    });
                                  },
                                ),
                              ),
                              Text('${xpValue.round()}', style: const TextStyle(color: AppColors.primaryWhite)),
                            ],
                          ),
                        ],
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            TextButton(
                              onPressed: () => Navigator.of(context).pop(),
                              child: const Text('CANCEL', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(width: 8),
                            if (isLoadingAuto)
                              const CircularProgressIndicator(color: AppColors.primaryRed)
                            else
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primaryRed,
                                  foregroundColor: AppColors.primaryWhite,
                                  shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                                ),
                                onPressed: () async {
                                  if (title.isEmpty) return;
                                  
                                  if (isAutoMode) {
                                    setState(() => isLoadingAuto = true);
                                    try {
                                      final chatService = ref.read(chatServiceProvider);
                                      final (stat, xp) = await chatService.autoDecideQuest(title);
                                      
                                      if (context.mounted) {
                                        ref.read(questsProvider.notifier).addCustomQuest(
                                          title, stat, selectedTimeSlot, xpReward: xp,
                                        );
                                        Navigator.of(context).pop();
                                      }
                                    } catch (e) {
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text('Error: $e')),
                                        );
                                        setState(() => isLoadingAuto = false);
                                      }
                                    }
                                  } else {
                                    ref.read(questsProvider.notifier).addCustomQuest(
                                      title, selectedStat, selectedTimeSlot, xpReward: xpValue.round(),
                                    );
                                    Navigator.of(context).pop();
                                  }
                                },
                                child: Text(isAutoMode ? 'AUTO-DECIDE & SAVE' : 'SAVE MISSION', style: const TextStyle(fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showDeleteConfirmation(Quest quest) {
    showDialog(
      context: context,
      builder: (ctx) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: Transform(
            transform: Matrix4.skewX(-0.14),
            child: Container(
              color: AppColors.backgroundDark,
              padding: const EdgeInsets.all(24.0),
              child: Transform(
                transform: Matrix4.skewX(0.14),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'DELETE MISSION?',
                      style: Theme.of(ctx).textTheme.titleLarge?.copyWith(
                        color: Colors.red,
                        fontWeight: FontWeight.w900,
                        fontStyle: FontStyle.italic,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '"${quest.title}" will be permanently removed.',
                      style: const TextStyle(color: AppColors.primaryWhite),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () => Navigator.of(ctx).pop(),
                          child: const Text('CANCEL', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            foregroundColor: AppColors.primaryWhite,
                            shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                          ),
                          onPressed: () {
                            ref.read(questsProvider.notifier).deleteQuest(quest.id);
                            Navigator.of(ctx).pop();
                          },
                          child: const Text('DELETE', style: TextStyle(fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
