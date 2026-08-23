/**
 * @module kernel/Text
 * @version 2.0.0
 * @description Zero-dependency text/case conversion utilities.
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 */
export namespace Text {
        /** @name        toKebab
         *  @public
         *  @description camelCase / PascalCase → kebab-case (each uppercase letter becomes `-` + its
         *               lowercase form).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Kebab-cased string (e.g. `"BackgroundColor"` → `"-background-color"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toKebab(s: string): string {
            return s.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
        }
        /** @name        toCamel
         *  @public
         *  @description kebab-case → camelCase, lowercasing the first character.
         *  @param       {string} s Source identifier.
         *  @returns     {string} Camel-cased string (e.g. `"Background-color"` → `"backgroundColor"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toCamel(s: string): string {
            const lc = s.charAt(0).toLowerCase() + s.slice(1);
            return lc.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
        }
        /** @name        toPascal
         *  @public
         *  @description Converts a single string identifier (kebab/snake/spaces/camel) to PascalCase.
         *  @param       {string} s Source identifier.
         *  @returns     {string} Pascal-cased string.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toPascal(s: string): string;
        /** @name        toPascal
         *  @public
         *  @description Converts an array of word strings into a single concatenated PascalCase string.
         *  @param       {readonly string[]} words Array of words.
         *  @returns     {string} Pascal-cased string.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toPascal(words: readonly string[]): string;
        /** @name        toPascal
         *  @public
         *  @description Converts multiple string arguments into a single concatenated PascalCase string.
         *  @param       {...string} words Multiple word arguments.
         *  @returns     {string} Pascal-cased string.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toPascal(...words: string[]): string;
        /** @name        toPascal
         *  @public
         *  @description Core implementation handling all 3 overloads with uppercase phonetics split.
         *  @param       {string | readonly string[]} first First identifier or array of words.
         *  @param       {...string} rest Remaining variadic string components.
         *  @returns     {string} Concatenated PascalCase string.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toPascal(first: string | readonly string[], ...rest: string[]): string {
            let tokens: string[] = [];
            if (Array.isArray(first)) {
                tokens = first;
            }
            else if (rest.length > 0) {
                tokens = [first as string, ...rest];
            }
            else if (typeof first === 'string' && first) {
                tokens = first
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/[-_\s]+/g, ' ')
                    .trim()
                    .split(/\s+/);
            }
            else {
                return '';
            }
            return tokens
                .filter(Boolean)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');
        }
        /** @name        toSnake
         *  @public
         *  @description camelCase / PascalCase → snake_case (each uppercase letter becomes `_` + its
         *               lowercase form).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Snake-cased string (e.g. `"BackgroundColor"` → `"_background-color"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toSnake(s: string): string {
            return s.replace(/([A-Z])/g, c => `_${c.toLowerCase()}`);
        }
        /** @name        toScreamingSnake
         *  @public
         *  @description camelCase / PascalCase → SCREAMING_SNAKE_CASE (each uppercase letter becomes `_`
         *               + its uppercase form, and the rest is capitalized).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Screaming-snake-cased string (e.g. `"BackgroundColor"` → `"_BACKGROUND_COLOR"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toScreamingSnake(s: string): string {
            return s.replace(/([A-Z])/g, c => `_${c}`).toUpperCase();
        }
        /** @name        toTrain
         *  @public
         *  @description camelCase / PascalCase → Train-Case (each uppercase letter becomes `-` + its
         *               uppercase form).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Train-cased string (e.g. `"backgroundColor"` → `"background-Color"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toTrain(s: string): string {
            return s.replace(/([A-Z])/g, c => `-${c}`);
        }
        /** @name        toFlat
         *  @public
         *  @description camelCase / PascalCase / separated → flatcase (removes all separators
         *               and converts everything to lowercase).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Flat-cased string (e.g. `"Background-Color"` → `"backgroundcolor"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toFlat(s: string): string {
            return s.replace(/[-_\s]/g, '').toLowerCase();
        }
        /** @name        toUpperFlat
         *  @public
         *  @description camelCase / PascalCase / separated → UPPERFLATCASE (removes all separators
         *               and converts everything to uppercase).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Upper-flat-cased string (e.g. `"Background-Color"` → `"BACKGROUNDCOLOR"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toUpperFlat(s: string): string {
            return s.replace(/[-_\s]/g, '').toUpperCase();
        }
    }

export default Text;
