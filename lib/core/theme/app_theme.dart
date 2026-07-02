import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.backgroundDark,
      primaryColor: AppColors.primaryRed,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primaryRed,
        secondary: AppColors.accentYellow,
        surface: AppColors.surfaceDark,
        background: AppColors.backgroundDark,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.rubik(
          fontSize: 48,
          fontWeight: FontWeight.w900,
          color: AppColors.primaryWhite,
          letterSpacing: 2,
        ),
        displayMedium: GoogleFonts.rubik(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: AppColors.primaryWhite,
        ),
        titleLarge: GoogleFonts.rubik(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: AppColors.primaryWhite,
        ),
        bodyLarge: GoogleFonts.rubik(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: AppColors.primaryWhite,
        ),
        bodyMedium: GoogleFonts.rubik(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: AppColors.primaryWhite,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryRed,
          foregroundColor: AppColors.primaryWhite,
          textStyle: GoogleFonts.rubik(
            fontWeight: FontWeight.bold,
            fontSize: 18,
            letterSpacing: 1.5,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(0), // Sharp edges like P5
          ),
        ),
      ),
    );
  }
}
