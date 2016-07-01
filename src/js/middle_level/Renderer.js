import GLBoost from '../globals';
import GLContext from '../low_level/core/GLContext';
import GLExtensionsManager from '../low_level/core/GLExtensionsManager';
import Geometry from '../low_level/geometries/Geometry';
import GLBoostObject from '../low_level/core/GLBoostObject';

/**
 * en: This class take a role as operator of rendering process. In order to render images to canvas, this Renderer class gathers other elements' data, decides a plan of drawing process, and then just execute it.<br>
 * ja: このクラスはレンダリングプロセスの制御を司ります。Canvasにイメージをレンダリングするために、このRendererクラスは他の要素のデータを集め、描画プロセスの計画を決定し、実行します。
 */
export default class Renderer extends GLBoostObject {
  constructor(glBoostContext, parameters) {
    super(glBoostContext);
    var _clearColor = parameters.clearColor;

    var gl = this._glContext.gl;

    var setDefaultGLStates = function setDefaultGLStates() {

      gl.enable( gl.DEPTH_TEST );
      gl.depthFunc( gl.LEQUAL );

      gl.enable( gl.BLEND );
      gl.blendEquation( gl.FUNC_ADD );
      gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

      gl.clearColor( _clearColor.red, _clearColor.green, _clearColor.blue, _clearColor.alpha );
      gl.clearDepth( 1 );
      gl.clearStencil( 0 );
    };

    setDefaultGLStates();

  }

  /**
   * en: draw elements of the scene.<br>
   * ja: sceneが持つオブジェクトを描画します
   * @param {Scene} scene a instance of Scene class
   */
  draw(expression) {
    expression.renderPaths.forEach((renderPath)=>{
      if (!renderPath.scene) {
        return;
      }

      var camera = false;
      renderPath.scene.cameras.forEach((elm)=> {
        if (elm.isMainCamera(renderPath.scene)) {
          camera = elm;
        }
      });

      var gl = this._glContext.gl;
      var glem = GLExtensionsManager.getInstance(this._glContext);

      let lights = renderPath.scene.lights;

      if (renderPath.fboOfRenderTargetTextures) {
        gl.bindTexture(gl.TEXTURE_2D, null);
        Geometry.clearMaterialCache();
        gl.bindFramebuffer(gl.FRAMEBUFFER, renderPath.fboOfRenderTargetTextures);
      }
      glem.drawBuffers(gl, renderPath.buffersToDraw); // set render target buffers for each RenderPath.

      if (renderPath.clearColor) {
        var color = renderPath.clearColor;
        gl.clearColor(color.x, color.y, color.z, color.w);
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }

      // draw opacity meshes.
      var opacityMeshes = renderPath.opacityMeshes;
      opacityMeshes.forEach((mesh)=> {
        mesh.draw(lights, camera, renderPath.scene);
      });

      if (camera) {
        renderPath.sortTransparentMeshes(camera);
      }
      // draw transparent meshes.
      var transparentMeshes = renderPath.transparentMeshes;
      transparentMeshes.forEach((mesh)=> {
        mesh.draw(lights, camera, renderPath.scene);
      });

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      glem.drawBuffers(gl, [gl.BACK]);

    });
  }

  /**
   * en: clear color/depth/stencil of canvas.<br>
   * ja: canvasのカラー、デプス、ステンシルのいずれか又は全てをクリアします。
   * @param {boolean} color_flg true: clear color, false: don't clear color
   * @param {boolean} depth_flg true: clear depth, false: don't clear depth
   * @param {boolean} stencil_flg  true: clear stencil, false: don't clear stencil
   */
  clearCanvas( color_flg, depth_flg, stencil_flg ) {

    var gl = this._glContext.gl;

    var bufferBits = 0;

    if ( color_flg === void 0 || color_flg ) bufferBits |= gl.COLOR_BUFFER_BIT;
    if ( depth_flg === void 0 || depth_flg ) bufferBits |= gl.DEPTH_BUFFER_BIT;
    if ( stencil_flg === void 0 || stencil_flg ) bufferBits |= gl.STENCIL_BUFFER_BIT;

    gl.clear( bufferBits );

  }

  /**
   * en: Get WebGL context.<br>
   * ja: WebGLコンテキストを取得します。
   * @returns {webglcontext} a context of WebGL
   */
  get glContext() {
    return this._glContext.gl;
  }


  /**
   * en: resize canvas and viewport.<br>
   * ja: canvasとビューポートをリサイズします。
   * @param {number} width en: width to resize, ja: リサイズする幅
   * @param {number} height en: height to resize, ja:リサイズする高さ
   */
  resize(width, height) {
    this._glContext.canvas.width = width;
    this._glContext.canvas.height = height;

    this._glContext.gl.viewport(0, 0, width, height);
  }

}
