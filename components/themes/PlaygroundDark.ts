/**
 * @module      components/themes/PlaygroundDark
 * @description AriannA Playground dark presentation skin.
 *
 * This theme is deliberately ADDITIVE: component implementation and canonical
 * default/light styling stay untouched.  Applying the theme only adds the
 * `AriannAPlaygroundDark` scope class and a scoped stylesheet.  Removing that
 * class immediately returns components to their canonical Reference look.
 *
 * First-pass coverage intentionally targets the simple/control families only:
 * inputs, display, navigation, charts and TreeView.  Layout keeps the polished
 * component-specific work already approved.  Finance, Maps, Payments, 3D,
 * Shipments/Trackers, Audio, Video, Graphics 2D and Graphics Colors are not
 * restyled here.
 */

import { Css } from '../../core/index.ts';

export namespace PlaygroundDark
{
    export const Class = 'AriannAPlaygroundDark';

    const { Rule, Stylesheet } = Css;

    let Sheet: Css.Stylesheet | null = null;

    const S = `.${Class}`;

    /**
     * Create the stylesheet once.  Rules are scoped, so installing the sheet is
     * harmless until `Apply()` adds the scope class to a root element.
     */
    export function Install(): Css.Stylesheet
    {
        if(Sheet) return Sheet;

        Sheet = new Stylesheet
        (
            [
                // ── Shared Playground palette ──────────────────────────────
                new Rule(S,
                {
                    '--arianna-bg'          : '#0e0e10',
                    '--arianna-bg-2'        : '#16171a',
                    '--arianna-bg-3'        : '#1d1f23',
                    '--arianna-bg-4'        : '#25272c',
                    '--arianna-text'        : '#e6e8eb',
                    '--arianna-muted'       : '#8a8f98',
                    '--arianna-dim'         : '#646a73',
                    '--arianna-border'      : '#303238',
                    '--arianna-primary'     : '#e40c88',
                    '--arianna-success'     : '#22c55e',
                    '--arianna-warning'     : '#f59e0b',
                    '--arianna-danger'      : '#ff5a66',
                    '--arianna-info'        : '#58c4dc',
                    '--arianna-radius'      : '7px',
                    '--arianna-radius-sm'   : '5px',
                    '--arianna-radius-lg'   : '10px',
                    '--arianna-focus-ring'  : 'rgba(228,12,136,.28)',
                    Color                   : '#e6e8eb',
                    ColorScheme             : 'dark',
                }),

                new Rule(`${S} ::selection`,
                {
                    Background : 'rgba(228,12,136,.34)',
                    Color      : '#ffffff',
                }),

                // ── Inputs · Button ────────────────────────────────────────
                // Button uses a closed shadow root, so variables are the safe
                // and intentional theming channel.
                new Rule(`${S} arianna-button`,
                {
                    '--arianna-button-bg'             : 'linear-gradient(180deg,#26282d 0%,#1a1b1f 100%)',
                    '--arianna-button-border'         : '1px solid #3a3d45',
                    '--arianna-button-color'          : '#e6e8eb',
                    '--arianna-button-radius'         : '7px',
                    '--arianna-button-padding'        : '7px 14px',
                    '--arianna-button-primary-bg'     : 'linear-gradient(180deg,#f01892 0%,#c30974 100%)',
                    '--arianna-button-primary-border' : '1px solid #ff3aa1',
                    '--arianna-button-primary-color'  : '#ffffff',
                    '--arianna-button-danger-bg'      : 'linear-gradient(180deg,#da4753 0%,#a92732 100%)',
                    '--arianna-button-danger-border'  : '1px solid #ef6671',
                    '--arianna-button-danger-color'   : '#ffffff',
                    '--arianna-button-ghost-color'    : '#d9dce1',
                    '--arianna-button-link-color'     : '#ff4aa9',
                }),

                // ── Inputs · text/search/date/time/dropdown ────────────────
                new Rule(`${S} arianna-text-field .ar-textfield__input, ${S} arianna-search-bar, ${S} arianna-date-picker .ar-datepicker__wrap, ${S} arianna-time-picker .ar-timepicker__wrap, ${S} arianna-dropdown .ar-dropdown__trigger`,
                {
                    Background : 'linear-gradient(180deg,#17181b 0%,#121316 100%)',
                    Border     : '1px solid #343740',
                    BoxShadow  : 'inset 0 1px 0 rgba(255,255,255,.025)',
                    Color      : '#e6e8eb',
                }),
                new Rule(`${S} arianna-text-field .ar-textfield__input:hover, ${S} arianna-search-bar:hover, ${S} arianna-date-picker .ar-datepicker__wrap:hover, ${S} arianna-time-picker .ar-timepicker__wrap:hover, ${S} arianna-dropdown .ar-dropdown__trigger:hover`,
                {
                    BorderColor : '#454953',
                }),
                new Rule(`${S} arianna-text-field .ar-textfield__input:focus, ${S} arianna-search-bar:focus-within, ${S} arianna-date-picker .ar-datepicker__wrap:focus-within, ${S} arianna-time-picker .ar-timepicker__wrap:focus-within, ${S} arianna-dropdown:focus-within .ar-dropdown__trigger`,
                {
                    BorderColor : '#e40c88',
                    BoxShadow   : '0 0 0 3px rgba(228,12,136,.16)',
                    Outline     : 'none',
                }),
                new Rule(`${S} arianna-time-picker .ar-timepicker__popup`,
                {
                    Background : '#16171a',
                    Border     : '1px solid #353840',
                    BoxShadow  : '0 18px 48px rgba(0,0,0,.46)',
                }),
                new Rule(`${S} arianna-time-picker .ar-timepicker__select`,
                {
                    Background : '#1d1f23',
                    Border     : '1px solid #3a3d45',
                    Color      : '#e6e8eb',
                    ColorScheme: 'dark',
                }),
                new Rule(`${S} arianna-time-picker .ar-timepicker__action`,
                {
                    Background : '#1d1f23',
                    Border     : '1px solid #3a3d45',
                    Color      : '#e6e8eb',
                }),
                new Rule(`${S} arianna-time-picker .ar-timepicker__action--done`,
                {
                    Background  : '#e40c88',
                    BorderColor : '#ff3aa1',
                    Color       : '#ffffff',
                }),
                new Rule(`${S} arianna-dropdown .ar-dropdown__list`,
                {
                    Background : '#16171a',
                    Border     : '1px solid #353840',
                    BoxShadow  : '0 18px 48px rgba(0,0,0,.46)',
                }),
                new Rule(`${S} arianna-dropdown .ar-dropdown__option:hover, ${S} arianna-dropdown .ar-dropdown__option--active`,
                {
                    Background : 'rgba(228,12,136,.12)',
                    Color      : '#ffffff',
                }),
                new Rule(`${S} arianna-dropdown .ar-dropdown__search`,
                {
                    Background : '#101114',
                    Border     : '1px solid #303238',
                    Color      : '#e6e8eb',
                }),

                // ── Inputs · toggle controls ───────────────────────────────
                new Rule(`${S} arianna-checkbox .ar-checkbox__box, ${S} arianna-radio .ar-radio__circle`,
                {
                    Background : '#111216',
                    Border     : '1px solid #4a4e58',
                    BoxShadow  : 'inset 0 1px 1px rgba(0,0,0,.35)',
                }),
                new Rule(`${S} arianna-checkbox .ar-checkbox__input:checked + .ar-checkbox__box, ${S} arianna-radio .ar-radio__input:checked + .ar-radio__circle`,
                {
                    Background  : '#e40c88',
                    BorderColor : '#ff3aa1',
                }),
                new Rule(`${S} arianna-switch .ar-switch__track`,
                {
                    Background : '#30333a',
                    Border     : '1px solid #444851',
                    BoxShadow  : 'inset 0 2px 5px rgba(0,0,0,.32)',
                }),
                new Rule(`${S} arianna-switch .ar-switch__input:checked + .ar-switch__track`,
                {
                    Background  : 'linear-gradient(90deg,#b8076d,#e40c88)',
                    BorderColor : '#ff3aa1',
                }),
                new Rule(`${S} arianna-switch .ar-switch__track::after`,
                {
                    Background : '#f4f5f7',
                    BoxShadow  : '0 2px 5px rgba(0,0,0,.48)',
                }),

                // ── Inputs · sliders/rating/chips ──────────────────────────
                new Rule(`${S} arianna-range-slider .ar-slider__input`,
                {
                    AccentColor : '#e40c88',
                }),
                new Rule(`${S} arianna-range-slider .ar-slider__value`,
                {
                    Background   : '#24262b',
                    Border       : '1px solid #353840',
                    BorderRadius : '6px',
                    Color        : '#ff4aa9',
                    Padding      : '2px 7px',
                }),
                new Rule(`${S} arianna-rating .ar-rating__star`,
                {
                    Color      : '#4a4d55',
                    TextShadow : '0 1px 0 rgba(0,0,0,.4)',
                }),
                new Rule(`${S} arianna-rating .ar-rating__star--filled, ${S} arianna-rating .ar-rating__star:hover:not(:disabled)`,
                {
                    Color      : '#ff3aa1',
                    TextShadow : '0 0 14px rgba(228,12,136,.26)',
                }),
                new Rule(`${S} arianna-input-chip .ar-chip`,
                {
                    Background   : '#1d1f23',
                    Border       : '1px solid #343740',
                    BorderRadius : '999px',
                    Color        : '#cfd3d9',
                }),
                new Rule(`${S} arianna-input-chip .ar-chip--on`,
                {
                    Background  : 'rgba(228,12,136,.14)',
                    BorderColor : '#e40c88',
                    Color       : '#ff6fba',
                }),

                // ── Inputs · Calendar / Color / Upload ─────────────────────
                new Rule(`${S} arianna-calendar`,
                {
                    Background   : '#141519',
                    Border       : '1px solid #303238',
                    BorderRadius : '10px',
                    BoxShadow    : '0 18px 46px rgba(0,0,0,.28)',
                    Padding      : '10px',
                }),
                new Rule(`${S} arianna-calendar .ar-cal__header`,
                {
                    Background   : '#1b1d21',
                    BorderRadius : '7px',
                    Padding      : '7px 8px',
                }),
                new Rule(`${S} arianna-calendar .ar-cal__day:hover:not(.ar-cal__day--disabled)`,
                {
                    Background : '#24262b',
                    Color      : '#ffffff',
                }),
                new Rule(`${S} arianna-calendar .ar-cal__day--selected`,
                {
                    Background : '#e40c88',
                    Color      : '#ffffff',
                    BoxShadow  : '0 4px 12px rgba(228,12,136,.24)',
                }),
                new Rule(`${S} arianna-calendar .ar-cal__day--today`,
                {
                    BoxShadow : 'inset 0 0 0 1px #e40c88',
                    Color     : '#ff5fb0',
                }),
                new Rule(`${S} arianna-calendar .ar-cal__day--selected.ar-cal__day--today`,
                {
                    Background  : '#e40c88',
                    BorderColor : 'transparent',
                    BoxShadow   : 'inset 0 0 0 1px rgba(255,255,255,.55), 0 4px 12px rgba(228,12,136,.24)',
                    Color       : '#ffffff',
                }),
                new Rule(`${S} arianna-color-picker .ar-colorpicker__swatch`,
                {
                    Border     : '1px solid #464a54',
                    BoxShadow  : '0 3px 10px rgba(0,0,0,.28)',
                }),
                new Rule(`${S} arianna-color-picker .ar-colorpicker__hex`,
                {
                    Background   : '#111216',
                    Border       : '1px solid #343740',
                    BorderRadius : '6px',
                    Color        : '#e6e8eb',
                }),
                new Rule(`${S} arianna-color-picker .ar-colorpicker__preset`,
                {
                    Border    : '1px solid #3b3e46',
                    BoxShadow : '0 2px 8px rgba(0,0,0,.24)',
                }),
                new Rule(`${S} arianna-file-upload .ar-fileupload__zone`,
                {
                    Background   : 'linear-gradient(180deg,#17181b,#121316)',
                    Border       : '1px dashed #474b55',
                    BorderRadius : '10px',
                }),
                new Rule(`${S} arianna-file-upload .ar-fileupload__zone:hover, ${S} arianna-file-upload .ar-fileupload__zone--over`,
                {
                    Background  : 'rgba(228,12,136,.07)',
                    BorderColor : '#e40c88',
                }),

                // ── Inputs · Rich text editor ──────────────────────────────
                new Rule(`${S} arianna-richtext-editor .rte-wrap`,
                {
                    Background   : '#131417',
                    Border       : '1px solid #303238',
                    BorderRadius : '9px',
                    BoxShadow    : '0 10px 30px rgba(0,0,0,.18)',
                    Overflow     : 'hidden',
                }),
                new Rule(`${S} arianna-richtext-editor .rte-toolbar`,
                {
                    Background   : 'linear-gradient(180deg,#22242a,#1a1b1f)',
                    BorderBottom : '1px solid #303238',
                }),
                new Rule(`${S} arianna-richtext-editor .rte-btn`,
                {
                    Background   : 'transparent',
                    Border       : '1px solid transparent',
                    BorderRadius : '5px',
                    Color        : '#bfc4cb',
                }),
                new Rule(`${S} arianna-richtext-editor .rte-btn:hover`,
                {
                    Background  : '#292b31',
                    BorderColor : '#3b3e46',
                    Color       : '#ffffff',
                }),
                new Rule(`${S} arianna-richtext-editor .rte-btn:active`,
                {
                    Background  : 'rgba(228,12,136,.14)',
                    BorderColor : '#e40c88',
                    Color       : '#ff5fb0',
                }),
                new Rule(`${S} arianna-richtext-editor .rte-body`,
                {
                    Background : '#111216',
                    Color      : '#e6e8eb',
                }),

                // ── Display · badges / chips / tags ────────────────────────
                new Rule(`${S} arianna-badge, ${S} arianna-chip, ${S} arianna-tag .ar-tag`,
                {
                    BoxShadow : 'inset 0 1px 0 rgba(255,255,255,.035)',
                }),
                new Rule(`${S} arianna-badge:not([variant]), ${S} arianna-chip:not([variant]), ${S} arianna-tag .ar-tag`,
                {
                    Background : '#24262b',
                    Border     : '1px solid #363941',
                    Color      : '#d6dae0',
                }),
                new Rule(`${S} arianna-avatar`,
                {
                    BoxShadow : '0 0 0 1px #343740, 0 8px 20px rgba(0,0,0,.24)',
                }),
                new Rule(`${S} arianna-avatar .ar-avatar__status`,
                {
                    Border : '2px solid #16171a',
                }),
                new Rule(`${S} arianna-banner`,
                {
                    Background   : '#17181b',
                    Border       : '1px solid #303238',
                    BorderLeft   : '3px solid #e40c88',
                    BorderRadius : '8px',
                    BoxShadow    : '0 8px 24px rgba(0,0,0,.16)',
                }),
                new Rule(`${S} arianna-list .ar-list__container`,
                {
                    Background   : '#141519',
                    Border       : '1px solid #303238',
                    BorderRadius : '9px',
                    Overflow     : 'hidden',
                }),
                new Rule(`${S} arianna-list .ar-list__item:hover:not(.ar-list__item--disabled)`,
                {
                    Background : '#1d1f23',
                }),
                new Rule(`${S} arianna-list .ar-list__item--selected`,
                {
                    Background : 'rgba(228,12,136,.12)',
                    BoxShadow  : 'inset 3px 0 0 #e40c88',
                }),

                // ── Display · progress / skeleton ──────────────────────────
                new Rule(`${S} arianna-progress-bar .ar-progress__track`,
                {
                    Background : '#25272c',
                    BoxShadow  : 'inset 0 1px 3px rgba(0,0,0,.38)',
                }),
                new Rule(`${S} arianna-progress-bar .ar-progress__bar--default`,
                {
                    Background : 'linear-gradient(90deg,#b8076d,#e40c88,#ff4aa9)',
                    BoxShadow  : '0 0 12px rgba(228,12,136,.24)',
                }),
                new Rule(`${S} arianna-progress-circular .ar-progress-circ__spin`,
                {
                    BorderColor    : '#303238',
                    BorderTopColor : '#e40c88',
                }),
                new Rule(`${S} arianna-skeleton .ar-skeleton__line, ${S} arianna-skeleton .ar-skeleton__rect, ${S} arianna-skeleton .ar-skeleton__circle`,
                {
                    Background : 'linear-gradient(90deg,#1c1e22 20%,#2b2e34 40%,#1c1e22 60%)',
                }),

                // ── Display · Snackbar / Tooltip ───────────────────────────
                new Rule(`${S} arianna-snackbar`,
                {
                    Background   : 'linear-gradient(180deg,#24262b,#17181b)',
                    Border       : '1px solid #3a3d45',
                    BorderRadius : '8px',
                    BoxShadow    : '0 18px 52px rgba(0,0,0,.52)',
                    Color        : '#f0f1f3',
                }),
                new Rule(`${S} arianna-tooltip .ar-tooltip`,
                {
                    Background   : '#08090b',
                    Border       : '1px solid #343740',
                    BorderRadius : '6px',
                    BoxShadow    : '0 10px 30px rgba(0,0,0,.42)',
                    Color        : '#f5f6f7',
                }),

                // ── Navigation · breadcrumb / header / pagination ──────────
                new Rule(`${S} arianna-breadcrumb .ar-breadcrumb__link`,
                {
                    Color : '#b6bbc3',
                }),
                new Rule(`${S} arianna-breadcrumb .ar-breadcrumb__link:hover`,
                {
                    Color : '#ff4aa9',
                }),
                new Rule(`${S} arianna-header`,
                {
                    Background   : 'rgba(22,23,26,.92)',
                    BackdropFilter: 'blur(16px) saturate(140%)',
                    BorderBottom : '1px solid #303238',
                    BoxShadow    : '0 8px 24px rgba(0,0,0,.12)',
                }),
                new Rule(`${S} arianna-pagination .ar-pagination__btn`,
                {
                    Background   : '#1b1d21',
                    Border       : '1px solid #343740',
                    BorderRadius : '6px',
                    Color        : '#cfd3da',
                }),
                new Rule(`${S} arianna-pagination .ar-pagination__btn:hover:not(:disabled)`,
                {
                    Background  : '#25272c',
                    BorderColor : '#4a4e58',
                    Color       : '#ffffff',
                }),
                new Rule(`${S} arianna-pagination .ar-pagination__btn--active`,
                {
                    Background  : '#e40c88',
                    BorderColor : '#ff3aa1',
                    Color       : '#ffffff',
                    BoxShadow   : '0 5px 14px rgba(228,12,136,.2)',
                }),

                // ── Navigation · menu / rail / sidebar / stepper ───────────
                new Rule(`${S} arianna-menu`,
                {
                    Background   : '#16171a',
                    Border       : '1px solid #343740',
                    BorderRadius : '8px',
                    BoxShadow    : '0 18px 48px rgba(0,0,0,.48)',
                    Padding      : '5px',
                }),
                new Rule(`${S} arianna-menu .ar-menu__item`,
                {
                    BorderRadius : '5px',
                    Color        : '#d2d6dc',
                }),
                new Rule(`${S} arianna-menu .ar-menu__item:hover:not(:disabled)`,
                {
                    Background : '#24262b',
                    Color      : '#ffffff',
                }),
                new Rule(`${S} arianna-nav-rail`,
                {
                    Background   : '#141519',
                    Border       : '1px solid #303238',
                    BorderRadius : '10px',
                    BoxShadow    : '0 14px 36px rgba(0,0,0,.24)',
                }),
                new Rule(`${S} arianna-nav-rail .ar-navrail__item--active`,
                {
                    Background : 'rgba(228,12,136,.14)',
                    Color      : '#ff5fb0',
                }),
                new Rule(`${S} arianna-sidebar`,
                {
                    Background : '#121316',
                    BoxShadow  : '8px 0 28px rgba(0,0,0,.16)',
                }),
                new Rule(`${S} arianna-sidebar .ar-sidebar__search`,
                {
                    Background   : '#0e0f12',
                    Border       : '1px solid #303238',
                    BorderRadius : '6px',
                    Color        : '#e6e8eb',
                }),
                new Rule(`${S} arianna-sidebar .ar-sidebar__item:hover:not(.ar-sidebar__item--disabled)`,
                {
                    Background : '#1d1f23',
                }),
                new Rule(`${S} arianna-sidebar .ar-sidebar__item--active`,
                {
                    Background : 'rgba(228,12,136,.12)',
                    BoxShadow  : 'inset 3px 0 0 #e40c88',
                    Color      : '#ffffff',
                }),
                new Rule(`${S} arianna-stepper .ar-stepper__dot`,
                {
                    Background : '#25272c',
                    Border     : '1px solid #454953',
                    Color      : '#aeb3bb',
                }),
                new Rule(`${S} arianna-stepper .ar-stepper__step--active .ar-stepper__dot`,
                {
                    Background  : '#e40c88',
                    BorderColor : '#ff3aa1',
                    Color       : '#ffffff',
                    BoxShadow   : '0 0 0 4px rgba(228,12,136,.12)',
                }),
                new Rule(`${S} arianna-stepper .ar-stepper__step--done .ar-stepper__dot`,
                {
                    Background  : '#1f9d55',
                    BorderColor : '#2fbd6c',
                    Color       : '#ffffff',
                }),

                // ── Charts ─────────────────────────────────────────────────
                new Rule(`${S} arianna-bar-chart, ${S} arianna-line-chart, ${S} arianna-pie-chart`,
                {
                    Background   : 'linear-gradient(180deg,#141519,#101114)',
                    Border       : '1px solid #303238',
                    BorderRadius : '10px',
                    BoxShadow    : '0 14px 38px rgba(0,0,0,.22)',
                    Color        : '#d7dbe1',
                    Padding      : '12px',
                }),
                new Rule(`${S} arianna-bar-chart .bc-grid, ${S} arianna-line-chart .lc-grid`,
                {
                    Stroke : '#2b2e34',
                }),
                new Rule(`${S} arianna-bar-chart .bc-zero`,
                {
                    Stroke : '#555a64',
                }),
                new Rule(`${S} arianna-bar-chart .bc-tick, ${S} arianna-bar-chart .bc-label, ${S} arianna-line-chart .lc-tick, ${S} arianna-pie-chart .pc-label`,
                {
                    Fill : '#8f959f',
                }),
                new Rule(`${S} arianna-bar-chart .bc-val`,
                {
                    Fill       : '#e6e8eb',
                    FontWeight : '600',
                }),
                new Rule(`${S} arianna-bar-chart .bc-bar`,
                {
                    Fill : '#e40c88',
                }),
                new Rule(`${S} arianna-line-chart .lc-line`,
                {
                    Stroke : '#ff3aa1',
                }),
                new Rule(`${S} arianna-line-chart .lc-area`,
                {
                    Fill : 'rgba(228,12,136,.10)',
                }),
                new Rule(`${S} arianna-line-chart .lc-dot`,
                {
                    Fill   : '#ff3aa1',
                    Stroke : '#16171a',
                }),
                new Rule(`${S} arianna-pie-chart .pc-legend`,
                {
                    Color : '#b6bbc3',
                }),

                // ── Data · TreeView ────────────────────────────────────────
                new Rule(`${S} arianna-tree-view`,
                {
                    Background   : '#131417',
                    Border       : '1px solid #303238',
                    BorderRadius : '9px',
                    BoxShadow    : '0 12px 34px rgba(0,0,0,.2)',
                    Color        : '#d9dde2',
                    Overflow     : 'hidden',
                }),
                new Rule(`${S} arianna-tree-view .ar-tree__search`,
                {
                    Background   : '#0e0f12',
                    Border       : '1px solid #303238',
                    BorderRadius : '6px',
                    Color        : '#e6e8eb',
                }),
                new Rule(`${S} arianna-tree-view .ar-tree__row:hover`,
                {
                    Background : '#1d1f23',
                }),
                new Rule(`${S} arianna-tree-view .ar-tree__row--on`,
                {
                    Background : 'rgba(228,12,136,.12)',
                    BoxShadow  : 'inset 3px 0 0 #e40c88',
                    Color      : '#ffffff',
                }),
            ]
        );

        return Sheet;
    }

    /** Apply the Playground dark skin to a root element. */
    export function Apply(root: Element = document.documentElement): Css.Stylesheet
    {
        const sheet = Install();
        root.classList.add(Class);
        return sheet;
    }

    /** Remove only the scope class; the canonical component sheets remain live. */
    export function Remove(root: Element = document.documentElement): void
    {
        root.classList.remove(Class);
    }

    /** Returns true when the scope class is active on `root`. */
    export function IsApplied(root: Element = document.documentElement): boolean
    {
        return root.classList.contains(Class);
    }
}

export default PlaygroundDark;
