import Language from "@lib/localization/enums/language";
import * as path from 'path';
import Logger from "@lib/helpers/logger";
import * as fs from 'fs';

export default class LocalizationService {
    private static currentLanguage: Language = Language.ENGLISH;
    private static translations;

    public static getDefaultLanguage = (): Language => Language.ENGLISH;

    public static setLanguage = (language: Language) => {
        LocalizationService.loadJSONTranslations();
        if (!LocalizationService.translations[language]) {
            throw new Error(`There are no translations for this language`);
        }

        LocalizationService.currentLanguage = language;
    }

    public static loadJSONTranslations = () => {
        try {
            const translationsPath = path.join(__dirname, 'assets', 'translations');
            const translationFiles = fs.readdirSync(translationsPath).filter((file) => file.endsWith('.json'));

            const translations = {};

            translationFiles.forEach((translationFile) => {
                const languageName = translationFile.split('.').shift();
                const translationData = JSON.parse(fs.readFileSync(path.join(translationsPath, translationFile)).toString());
                translations[languageName] = translationData;
            });

            LocalizationService.translations = translations;
        } catch (e) {
            throw new Error(`Error while loading translations! ${e}`)
        }
        const missingTranslations = LocalizationService.findMissingTranslations();

        if (missingTranslations) {
            Logger.makeLogFile('missingTranslations', missingTranslations);
        }
    }

    public static translate = (key: string, placeholders?: any) => {
        if (!LocalizationService.translations) {
            LocalizationService.loadJSONTranslations();
        }

        let placeholderString = '';

        if (placeholders) {
            Object.keys(placeholders).forEach((placeholderKey) => {
                const placeholderValue: any = placeholders[placeholderKey];
                placeholderString += ` ${placeholderKey}: ${placeholderValue}`;
            });
        }

        if (!LocalizationService.translations[LocalizationService.currentLanguage]) {
            Logger.appendToFile('translation_errors', `${key} missing language ${LocalizationService.currentLanguage}! ${placeholderString}`)
            return `${key} missing language ${LocalizationService.currentLanguage}! ${placeholderString}`
        }

        let translation: any = LocalizationService.translations[LocalizationService.currentLanguage][key] || LocalizationService.translations[LocalizationService.getDefaultLanguage()][key] || `${key} missing translation! ${placeholderString}`;

        if (placeholders) {
            Object.keys(placeholders).forEach((placeholderKey) => {
                const placeholderValue: any = placeholders[placeholderKey];
                translation = translation.replace(`{${placeholderKey}}`, placeholderValue);
            });
        }

        if (translation.includes('missing translation')) {
            Logger.appendToFile('translation_errors', translation);
        }

        return translation;
    }

    public static findMissingTranslations = () => {
        let missingTranslations = '';

        if (!LocalizationService.translations) {
            LocalizationService.loadJSONTranslations();
        }

        const languages = Object.keys(LocalizationService.translations);

        languages.forEach((language) => {
            const languageTranslations = LocalizationService.translations[language];
            const languageKeys = Object.keys(languageTranslations);

            languages.forEach((compareLanguage) => {
                if (compareLanguage !== language) {
                    const compareLanguageTranslations = LocalizationService.translations[compareLanguage];
                    const compareLanguageKeys = Object.keys(compareLanguageTranslations);

                    languageKeys.forEach((key) => {
                        if (!compareLanguageKeys.includes(key)) {
                            missingTranslations += `${LocalizationService.getLongLanguageCodeForLanguage(compareLanguage as Language)} is missing ${key}\r\n`;
                        }
                    });
                }
            });
        });

        return missingTranslations;
    }

    public static getLongLanguageCodeForLanguage = (language: Language): string => {
        switch (language) {
            case Language.CATALAN: return 'català';
            case Language.SPANISH: return 'Español';
            case Language.ENGLISH: return 'English';
            case Language.FRENCH: return 'Français';
            case Language.GERMAN: return 'Deutsch';
            default: return 'Unknown language';
        }
    }
}
