
export default class SkeletalShaderSource {

  VSDefine_SkeletalShaderSource(in_, out_, f, lights, material, extraData) {
    var shaderText = '';
    shaderText += `${in_} vec4 aVertex_joint;\n`;
    shaderText += `${in_} vec4 aVertex_weight;\n`;
    shaderText += 'uniform mat4 skinTransformMatrices[' + extraData.jointN  + '];\n';
    shaderText += `uniform mat4 invWorldMatrix;\n`;
    return shaderText;
  }

  /**
   * @return {string}
   */
  VSTransform_SkeletalShaderSource(existCamera_f, f, lights, material, extraData) {
    var shaderText = '';

    shaderText += 'vec4 weightVec = normalize(aVertex_weight);\n';
    shaderText += 'mat4 skinMat = weightVec.x * skinTransformMatrices[int(aVertex_joint.x)];\n';
    shaderText += 'skinMat += weightVec.y * skinTransformMatrices[int(aVertex_joint.y)];\n';
    shaderText += 'skinMat += weightVec.z * skinTransformMatrices[int(aVertex_joint.z)];\n';
    shaderText += 'skinMat += weightVec.w * skinTransformMatrices[int(aVertex_joint.w)];\n';

    shaderText += '  vec4 position = invWorldMatrix * vec4(aVertex_position.x, aVertex_position.y, aVertex_position.z, 1.0);';

    if (existCamera_f) {
      shaderText += '  gl_Position = pvwMatrix * skinMat * position;\n';
    } else {
      shaderText += '  gl_Position = skinMat * vec4(aVertex_position, 1.0);\n';
    }

    return shaderText;
  }

  prepare_SkeletalShaderSource(gl, shaderProgram, vertexAttribs, existCamera_f, lights, material, extraData, canvas) {
    var vertexAttribsAsResult = [];

    vertexAttribs.forEach((attribName)=>{
      if (attribName === GLBoost.JOINT || attribName === GLBoost.WEIGHT) {
        vertexAttribsAsResult.push(attribName);
        shaderProgram['vertexAttribute_' + attribName] = gl.getAttribLocation(shaderProgram, 'aVertex_' + attribName);
        gl.enableVertexAttribArray(shaderProgram['vertexAttribute_' + attribName]);
      }
    });

    shaderProgram['skinTransformMatrices'] = gl.getUniformLocation(shaderProgram, 'skinTransformMatrices');
    // とりあえず単位行列で初期化
    let identityMatrices = [];
    for (let i=0; i<extraData.jointN; i++) {
      Array.prototype.push.apply(identityMatrices,
        [1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1]
      );
    }
    gl.uniformMatrix4fv(shaderProgram['skinTransformMatrices'], false, new Float32Array(identityMatrices));

    shaderProgram['invWorldMatrix'] = gl.getUniformLocation(shaderProgram, 'invWorldMatrix');

    return vertexAttribsAsResult;
  }
}
