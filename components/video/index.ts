/**
 * @module    components/video
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — video widgets. Importing this module side-effect-registers 2
 * custom-element tags + re-exports their classes, types, and helpers.
 *
 * # Tags registered
 *
 *   arianna-video-player        VideoPlayer       (multi-provider playback)
 *   arianna-video-track-editor  VideoTrackEditor  (timeline editor)
 *
 * # Events (VideoPlayer)
 *   arianna:video-play, arianna:video-pause, arianna:video-timeupdate,
 *   arianna:video-ended, arianna:video-source
 *
 * # Events (VideoTrackEditor)
 *   arianna:editor-change, arianna:editor-select, arianna:editor-time
 *
 * # Web Audio routing
 *
 * VideoPlayer's audio track is only routable via Web Audio when (a) the
 * source is local/direct and (b) the widget is composed with the
 * `AudioComponent` base (audio/ batch). For remote provider iframes
 * (YouTube/Vimeo/Twitch) the audio is sandboxed by the provider's origin
 * and cannot be tapped from the page.
 */

export { VideoPlayer, detectVideoProvider } from './VideoPlayer.ts';
export type { VideoProvider, VideoPlayerOptions } from './VideoPlayer.ts';

export { VideoTrackEditor } from './VideoTrackEditor.ts';
export type { VideoClip } from './VideoTrackEditor.ts';
