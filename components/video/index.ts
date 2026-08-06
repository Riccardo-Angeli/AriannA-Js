/**
 * @module    components/video
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Barrel for AriannA video components, contracts and provider detection.
 */

import { VideoPlayer as VideoPlayerModule }           from './VideoPlayer.ts';
import { VideoTrackEditor as VideoTrackEditorModule } from './VideoTrackEditor.ts';

/** VideoPlayer namespace and implementation. */
export { VideoPlayer } from './VideoPlayer.ts';

/** VideoTrackEditor namespace and implementation. */
export { VideoTrackEditor } from './VideoTrackEditor.ts';

/** Detect the provider represented by a video URL. */
export const detectVideoProvider = VideoPlayerModule.detectVideoProvider;

/** Supported video-provider identifier. */
export type VideoProvider = VideoPlayerModule.Types.VideoProvider;

/** VideoPlayer construction options. */
export type VideoPlayerOptions = VideoPlayerModule.Interfaces.VideoPlayerOptions;

/** VideoTrackEditor clip contract. */
export type VideoClip = VideoTrackEditorModule.VideoClip;
