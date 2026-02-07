import { getCityBackgroundPaths } from '../constants/assets';

/**
 * Configuration for a single parallax layer.
 */
interface ParallaxLayer {
  image: Phaser.GameObjects.TileSprite;
  scrollFactor: number;
}

/**
 * Manages a multi-layer parallax scrolling background.
 * Supports both the legacy hand-placed backgrounds (level-01)
 * and the new city background themes (8 themes x day/night x 5 layers).
 */
export default class ParallaxBackground {
  private layers: ParallaxLayer[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Preload city background images for a specific theme and time of day.
   * Call this in the scene's preload() method.
   */
  static preloadTheme(
    load: Phaser.Loader.LoaderPlugin,
    theme: number,
    time: 'Day' | 'Night'
  ): void {
    const paths = getCityBackgroundPaths(theme, time);
    paths.forEach((path, index) => {
      const key = `city-bg-${theme}-${time.toLowerCase()}-${index + 1}`;
      load.image(key, path);
    });
  }

  /**
   * Creates the parallax layers for a city background theme.
   * Layers are ordered back-to-front with decreasing scroll factors
   * so distant layers move slower (parallax effect).
   *
   * The TileSprite dimensions use the actual game canvas size (not the
   * camera scroll bounds) so backgrounds fill the entire visible area.
   *
   * @param theme - Theme number (1-8)
   * @param time - 'Day' or 'Night'
   * @param _worldWidth - Unused, kept for API compat
   * @param _worldHeight - Unused, kept for API compat
   */
  createCityBackground(
    theme: number,
    time: 'Day' | 'Night',
    _worldWidth: number,
    _worldHeight: number
  ): void {
    // Use the actual game canvas dimensions so backgrounds fill the screen
    const canvasWidth = this.scene.scale.width;
    const canvasHeight = this.scene.scale.height;

    // 5 layers, back-to-front. Scroll factors from 0 (fixed sky) to 0.8.
    const scrollFactors = [0, 0.1, 0.3, 0.5, 0.8];

    for (let i = 0; i < 5; i++) {
      const key = `city-bg-${theme}-${time.toLowerCase()}-${i + 1}`;

      const tileSprite = this.scene.add
        .tileSprite(0, 0, canvasWidth, canvasHeight, key)
        .setOrigin(0, 0)
        .setScrollFactor(0) // We'll handle scrolling manually
        .setDepth(-10 + i);

      this.layers.push({
        image: tileSprite,
        scrollFactor: scrollFactors[i],
      });
    }
  }

  /**
   * Call in the scene's update() to scroll the parallax layers
   * based on camera position.
   */
  update(): void {
    const camera = this.scene.cameras.main;

    for (const layer of this.layers) {
      layer.image.tilePositionX = camera.scrollX * layer.scrollFactor;
      layer.image.tilePositionY = camera.scrollY * layer.scrollFactor;
    }
  }

  destroy(): void {
    for (const layer of this.layers) {
      layer.image.destroy();
    }
    this.layers = [];
  }
}
