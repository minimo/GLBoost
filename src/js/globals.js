var global = ('global',eval)('this');

global.GLBoost = global.GLBoost || { REVISION: '1' };

global.GLBoost['POSITION'] = 'position';
global.GLBoost['COLOR'] = 'color';
global.GLBoost['NORMAL'] = 'normal';
global.GLBoost['TEXCOORD'] = 'texcoord';
global.GLBoost['JOINT'] = 'joint';
global.GLBoost['WEIGHT'] = 'weight';
global.GLBoost['POINTS'] = 'POINTS';
global.GLBoost['LINES'] = 'LINES';
global.GLBoost['LINE_STRIP'] = 'LINE_STRIP';
global.GLBoost['LINE_LOOP'] = 'LINE_LOOP';
global.GLBoost['TRIANGLES'] = 'TRIANGLES';
global.GLBoost['TRIANGLE_STRIP'] = 'TRIANGLE_STRIP';
global.GLBoost['STATIC_DRAW'] = 'STATIC_DRAW';
global.GLBoost['STREAM_DRAW'] = 'STREAM_DRAW';
global.GLBoost['DYNAMIC_DRAW'] = 'DYNAMIC_DRAW';
global.GLBoost['BLENDTARGET1'] = 'shapetarget_1';
global.GLBoost['BLENDTARGET2'] = 'shapetarget_2';
global.GLBoost['BLENDTARGET3'] = 'shapetarget_3';
global.GLBoost['BLENDTARGET4'] = 'shapetarget_4';
global.GLBoost['BLENDTARGET5'] = 'shapetarget_5';
global.GLBoost['BLENDTARGET6'] = 'shapetarget_6';
global.GLBoost['BLENDTARGET7'] = 'shapetarget_7';
global.GLBoost['BLENDTARGET8'] = 'shapetarget_8';
global.GLBoost['BLENDTARGET9'] = 'shapetarget_9';
global.GLBoost['BLENDTARGET10'] = 'shapetarget_10';
global.GLBoost['RADIAN'] = 'radian';
global.GLBoost['DEGREE'] = 'degree';
global.GLBoost['RENDER_TARGET_NONE_COLOR'] = 0; // gl.NONE
global.GLBoost['COLOR_ATTACHMENT0'] = 0x8CE0; // gl.COLOR_ATTACHMENT0
global.GLBoost['UNPACK_FLIP_Y_WEBGL'] = 'UNPACK_FLIP_Y_WEBGL';
global.GLBoost['TEXTURE_MAG_FILTER'] = 'TEXTURE_MAG_FILTER';
global.GLBoost['TEXTURE_MIN_FILTER'] = 'TEXTURE_MIN_FILTER';
global.GLBoost['LINEAR'] = 'LINEAR';
global.GLBoost['LINEAR_MIPMAP_LINEAR'] = 'LINEAR_MIPMAP_LINEAR';
global.GLBoost['NEAREST'] = 'NEAREST';
global.GLBoost['TEXTURE_WRAP_S'] = 'TEXTURE_WRAP_S';
global.GLBoost['TEXTURE_WRAP_T'] = 'TEXTURE_WRAP_T';
global.GLBoost['REPEAT'] = 'REPEAT';
global.GLBoost['CLAMP_TO_EDGE'] = 'CLAMP_TO_EDGE';
global.GLBoost['MIRRORED_REPEAT'] = 'MIRRORED_REPEAT';
global.GLBoost['LOG_SHADER_CODE'] = 'LOG_SHADER_CODE';
global.GLBoost['LOG_GLBOOST_OBJECT_LIFECYCLE'] = 'LOG_GLBOOST_OBJECT_LIFECYCLE';
global.GLBoost['LOG_GL_RESOURCE_LIFECYCLE'] = 'LOG_GL_RESOURCE_LIFECYCLE';
export default global.GLBoost;

global.GLBoost.isThisGLVersion_2 = function(gl) {
  if (typeof WebGL2RenderingContext === 'undefined') {
    return false;
  }
  return gl instanceof WebGL2RenderingContext;
};
