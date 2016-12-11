import GLBoost from '../../globals';
import GLContext from '../../low_level/core/GLContext';
import M_SkeletalMesh from '../elements/meshes/M_SkeletalMesh';
import PhongShader from '../shaders/PhongShader';
import FreeShader from '../shaders/FreeShader';
import Vector3 from '../../low_level/math/Vector3';
import Vector2 from '../../low_level/math/Vector2';
import Vector4 from '../../low_level/math/Vector4';
import Matrix44 from '../../low_level/math/Matrix44';
import Quaternion from '../../low_level/math/Quaternion';
import ArrayUtil from '../../low_level/misc/ArrayUtil';
import DataUtil from '../../low_level/misc/DataUtil';

let singleton = Symbol();
let singletonEnforcer = Symbol();

/**
 * [en] This is a loader class of glTF file format. You can see more detail of glTF format at https://github.com/KhronosGroup/glTF .<br>
 * [ja] glTFファイルを読み込むためのローダークラスです。glTFファイルフォーマットについての詳細は https://github.com/KhronosGroup/glTF をご覧ください。
 */
export default class GLTFLoader {

  /**
   * [en] The constructor of GLTFLoader class. But you cannot use this constructor directly because of this class is a singleton class. Use getInstance() static method.<br>
   * [ja] GLTFLoaderクラスのコンストラクタです。しかし本クラスはシングルトンであるため、このコンストラクタは直接呼び出せません。getInstance()静的メソッドを使ってください。
   * @param {Symbol} enforcer [en] a Symbol to forbid calling this constructor directly [ja] このコンストラクタの直接呼び出しを禁止するためのシンボル
   */
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer) {
      throw new Error("This is a Singleton class. get the instance using 'getInstance' static method.");
    }
  }

  /**
   * [en] The static method to get singleton instance of this class.<br>
   * [ja] このクラスのシングルトンインスタンスを取得するための静的メソッド。
   * @return {GLTFLoader} [en] the singleton instance of GLTFLoader class [ja] GLTFLoaderクラスのシングルトンインスタンス
   */
  static getInstance() {
    if (!this[singleton]) {
      this[singleton] = new GLTFLoader(singletonEnforcer);
    }
    return this[singleton];
  }



  /**
   * [en] the method to load glTF file.<br>
   * [ja] glTF fileをロードするためのメソッド。
   * @param {string} url [en] url of glTF file [ja] glTFファイルのurl
   * @param {number} scale [en] scale of size of loaded models [ja] 読み込んだモデルのサイズのスケール
   * @param {Shader} defaultShader [en] a shader to assign to loaded geometries [ja] 読み込んだジオメトリに適用するシェーダー
   * @return {Promise} [en] a promise object [ja] Promiseオブジェクト
   */
  loadGLTF(glBoostContext, url, scale = 1.0, defaultShader = null) {
    return new Promise((resolve, reject) => {
      var partsOfPath = url.split('/');
      let ext = partsOfPath[partsOfPath.length - 1].split('.');
      ext = ext[ext.length - 1];
      if (ext === 'glb') {
        this._loadGLBInner(glBoostContext, url, scale, defaultShader, resolve, reject);
      } else {
        this._loadGLTFInner(glBoostContext, url, scale, defaultShader, resolve);
      }
    });
  }

  _loadGLTFInner(glBoostContext, url, scale, defaultShader, resolve) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4 && (Math.floor(xmlHttp.status / 100) === 2 || xmlHttp.status === 0)) {
        var gotText = xmlHttp.responseText;
        var partsOfPath = url.split('/');
        var basePath = '';
        for (var i = 0; i < partsOfPath.length - 1; i++) {
          basePath += partsOfPath[i] + '/';
        }
        //console.log(basePath);

        this._readBuffers(glBoostContext, gotText, basePath, canvas, scale, defaultShader, resolve);
      }
    };

    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
  }

  _loadGLBInner(glBoostContext, url, scale, defaultShader, resolve, reject) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";


    oReq.onload = (oEvent) => {
      var arrayBuffer = oReq.response;

      let dataView = new DataView(arrayBuffer, 0, 20);
      let isLittleEndian = true;

      // Magic field
      let magicStr = '';
      magicStr += String.fromCharCode(dataView.getUint8(0, isLittleEndian));
      magicStr += String.fromCharCode(dataView.getUint8(1, isLittleEndian));
      magicStr += String.fromCharCode(dataView.getUint8(2, isLittleEndian));
      magicStr += String.fromCharCode(dataView.getUint8(3, isLittleEndian));

      if (magicStr !== 'glTF') {
        reject('invalid Magic field in this binary glTF file.');
      }

      let gltfVer = dataView.getUint32(4, isLittleEndian);
      if (gltfVer !== 1) {
        reject('invalid version field in this binary glTF file.');
      }

      let lengthOfThisFile = dataView.getUint32(8, isLittleEndian);
      let lengthOfContent = dataView.getUint32(12, isLittleEndian);
      let contentFormat = dataView.getUint32(16, isLittleEndian);

      if (contentFormat !== 0) { // 0 means JSON format
        reject('invalid contentFormat field in this binary glTF file.');
      }


      let arrayBufferContent = arrayBuffer.slice(20, lengthOfContent + 20);
      let gotText = DataUtil.arrayBufferToString(arrayBufferContent);
      let json = JSON.parse(gotText);
      let arrayBufferBinary = arrayBuffer.slice(20 + lengthOfContent);

      this._loadShadersAndScene(glBoostContext, arrayBufferBinary, null, json, canvas, scale, defaultShader, resolve);
    };

    oReq.send(null);
  }

  _readBuffers(glBoostContext, gotText, basePath, canvas, scale, defaultShader, resolve) {
    var json = JSON.parse(gotText);

    for (let bufferName in json.buffers) {
      //console.log("name: " + bufferName + " data:" + );
      let bufferInfo = json.buffers[bufferName];

      if (bufferInfo.uri.match(/^data:application\/octet-stream;base64,/)) {
        this._loadInternalBase64Binary(glBoostContext, bufferInfo.uri, basePath, json, canvas, scale, defaultShader, resolve);
      } else {
        this._loadExternalBinaryFileUsingXHR(glBoostContext, basePath + bufferInfo.uri, basePath, json, canvas, scale, defaultShader, resolve);
      }
    }
  }

  _loadInternalBase64Binary(glBoostContext, dataUri, basePath, json, canvas, scale, defaultShader, resolve) {
    var arrayBuffer = DataUtil.base64ToArrayBuffer(dataUri);

    if (arrayBuffer) {
      this._loadShadersAndScene(glBoostContext, arrayBuffer, basePath, json, canvas, scale, defaultShader, resolve);
    }
  }

  _loadExternalBinaryFileUsingXHR(glBoostContext, binaryFilePath, basePath, json, canvas, scale, defaultShader, resolve) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", binaryFilePath, true);
    oReq.responseType = "arraybuffer";


    oReq.onload = (oEvent) => {
      var arrayBuffer = oReq.response;

      if (arrayBuffer) {
        this._loadShadersAndScene(glBoostContext, arrayBuffer, basePath, json, canvas, scale, defaultShader, resolve);
      }
    };

    oReq.send(null);
  }


  _asyncShaderAccess(fulfilled, shaderUri, shader, shaderType) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4 && (Math.floor(xmlHttp.status / 100) === 2 || xmlHttp.status === 0)) {
        let gotText = xmlHttp.responseText;
        shader.shaderText = gotText;
        shader.shaderType = shaderType;
        fulfilled();
      }
    };

    xmlHttp.open("GET", shaderUri, true);
    xmlHttp.send(null);
  }

  _loadShadersAndScene(glBoostContext, arrayBuffer, basePath, json, canvas, scale, defaultShader, resolve) {
    let shadersJson = json.shaders;
    let shaders = {};
    let promisesToLoadShaders = [];
    for (let shaderName in shadersJson) {
      shaders[shaderName] = {};

      let shaderJson = shadersJson[shaderName];
      let shaderType = shaderJson.type;
      if (typeof shaderJson.extensions !== 'undefined' && typeof shaderJson.extensions.KHR_binary_glTF !== 'undefined') {
        shaders[shaderName].shaderText = this._accessBinaryAsShader(shaderJson.extensions.KHR_binary_glTF.bufferView, json, arrayBuffer);
        shaders[shaderName].shaderType = shaderType;
        continue;
      }

      let shaderUri = shaderJson.uri;
      if (shaderUri.match(/^data:/)) {
        promisesToLoadShaders.push(
          new Promise((fulfilled, rejected) => {
            let arrayBuffer = DataUtil.base64ToArrayBuffer(shaderUri);
            shaders[shaderName].shaderText = DataUtil.arrayBufferToString(arrayBuffer);
            shaders[shaderName].shaderType = shaderType;
            fulfilled();
          })
        );
      } else {
        shaderUri = basePath + shaderUri;
        promisesToLoadShaders.push(
          new Promise((fulfilled, rejected) => {
            this._asyncShaderAccess(fulfilled, shaderUri, shaders[shaderName], shaderType);
          })
        );
      }
    }

    if (promisesToLoadShaders.length > 0) {
      Promise.resolve()
        .then(() => {
          return Promise.all(promisesToLoadShaders);
        })
        .then(() => {
          this._IterateNodeOfScene(glBoostContext, arrayBuffer, basePath, json, canvas, scale, defaultShader, shaders, resolve);
        });
    } else {
      this._IterateNodeOfScene(glBoostContext, arrayBuffer, basePath, json, canvas, scale, defaultShader, shaders, resolve);
    }

  }

  _IterateNodeOfScene(glBoostContext, arrayBuffer, basePath, json, canvas, scale, defaultShader, shaders, resolve) {
    let sceneStr = json.scene;
    let sceneJson = json.scenes[sceneStr];

    let group = glBoostContext.createGroup();
    group.userFlavorName = 'TopGroup';
    let nodeStr = null;
    for (let i = 0; i < sceneJson.nodes.length; i++) {
      nodeStr = sceneJson.nodes[i];

      // iterate nodes and load meshes
      let element = this._recursiveIterateNode(glBoostContext, nodeStr, arrayBuffer, basePath, json, canvas, scale, defaultShader, shaders);
      group.addChild(element);
    }

    // register joints hierarchy to skeletal mesh
    let skeletalMeshes = group.searchElementsByType(M_SkeletalMesh);
    skeletalMeshes.forEach((skeletalMesh) => {
      var rootJoint = group.searchElement(skeletalMesh.rootJointName);
      rootJoint._isRootJointGroup = true;
      skeletalMesh.jointsHierarchy = rootJoint;
    });

    // Animation
    this._loadAnimation(group, arrayBuffer, json, canvas, scale);

    resolve(group);
  }



  _recursiveIterateNode(glBoostContext, nodeStr, arrayBuffer, basePath, json, canvas, scale, defaultShader, shaders) {
    var nodeJson = json.nodes[nodeStr];
    var group = glBoostContext.createGroup();
    group.userFlavorName = nodeStr;

    if (nodeJson.translation) {
      group.translate = new Vector3(nodeJson.translation[0], nodeJson.translation[1], nodeJson.translation[2]);
    }
    if (nodeJson.scale) {
      group.scale = new Vector3(nodeJson.scale[0], nodeJson.scale[1], nodeJson.scale[2]);
    }
    if (nodeJson.rotation) {
      group.quaternion = new Quaternion(nodeJson.rotation[0], nodeJson.rotation[1], nodeJson.rotation[2], nodeJson.rotation[3]);
    }
    if (nodeJson.matrix) {
      group.multiplyMatrix(new Matrix44(nodeJson.matrix, true));
    }

    if (nodeJson.meshes) {
      for (let i = 0; i < nodeJson.meshes.length; i++) {
        // this node has mashes...
        let meshStr = nodeJson.meshes[i];
        let meshJson = json.meshes[meshStr];

        let rootJointStr = null;
        let skinStr = null;
        if (nodeJson.skeletons) {
          rootJointStr = nodeJson.skeletons[0];
          skinStr = nodeJson.skin;
        }
        let mesh = this._loadMesh(glBoostContext, meshJson, arrayBuffer, basePath, json, canvas, scale, defaultShader, rootJointStr, skinStr, shaders);
        mesh.userFlavorName = meshStr;
        group.addChild(mesh);
      }
    } else if (nodeJson.jointName) {
      let joint = glBoostContext.createJoint();
      joint.userFlavorName = nodeJson.jointName;
      group.addChild(joint);
    }

    for (let i = 0; i < nodeJson.children.length; i++) {
      let nodeStr = nodeJson.children[i];
      let childElement = this._recursiveIterateNode(glBoostContext, nodeStr, arrayBuffer, basePath, json, canvas, scale, defaultShader, shaders);
      group.addChild(childElement);
    }

    return group;
  }

  _loadMesh(glBoostContext, meshJson, arrayBuffer, basePath, json, canvas, scale, defaultShader, rootJointStr, skinStr, shaders) {
    var mesh = null;
    var geometry = null;
    let gl = GLContext.getInstance(canvas).gl;
    if (rootJointStr) {
      geometry = glBoostContext.createSkeletalGeometry();
      mesh = glBoostContext.createSkeletalMesh(geometry, null, rootJointStr);
      let skin = json.skins[skinStr];

      mesh.bindShapeMatrix = new Matrix44(skin.bindShapeMatrix, true);
      mesh.jointNames = skin.jointNames;

      let inverseBindMatricesAccessorStr = skin.inverseBindMatrices;
      mesh.inverseBindMatrices = this._accessBinary(inverseBindMatricesAccessorStr, json, arrayBuffer, 1.0, gl);
    } else {
      geometry = glBoostContext.createGeometry(canvas);
      mesh = glBoostContext.createMesh(geometry);
    }

    let _indicesArray = [];
    let _positions = [];
    let _normals = [];
    let vertexData = {
      position: _positions,
      normal: _normals,
      components: {},
      componentBytes: {},
      componentType: {}
    };
    let additional = {
      'joint': [],
      'weight': [],
      'texcoord': []
    };

    let dataViewMethodDic = {};

    let materials = [];
    let indicesAccumulatedLength = 0;
    for (let i = 0; i < meshJson.primitives.length; i++) {
      let primitiveJson = meshJson.primitives[i];

      // Geometry
      let positionsAccessorStr = primitiveJson.attributes.POSITION;
      let positions = this._accessBinary(positionsAccessorStr, json, arrayBuffer, scale, gl, false, true);
      _positions[i] = positions;
      vertexData.components.position = this._checkComponentNumber(positionsAccessorStr, json, gl);
      vertexData.componentBytes.position = this._checkBytesPerComponent(positionsAccessorStr, json, gl);
      vertexData.componentType.position = this._getDataType(positionsAccessorStr, json, gl);
      dataViewMethodDic.position = this._checkDataViewMethod(positionsAccessorStr, json, gl);


      let indices = null;
      if (typeof primitiveJson.indices !== 'undefined') {
        let indicesAccessorStr = primitiveJson.indices;
        indices = this._accessBinary(indicesAccessorStr, json, arrayBuffer, 1.0, gl);
        for (let j=0; j<indices.length; j++) {
          indices[j] = indicesAccumulatedLength + indices[j];
        }
        _indicesArray[i] = indices;
        indicesAccumulatedLength += _positions[i].length /  vertexData.components.position;
      }


      let normalsAccessorStr = primitiveJson.attributes.NORMAL;
      let normals = this._accessBinary(normalsAccessorStr, json, arrayBuffer, 1.0, gl, false, true);
      //Array.prototype.push.apply(_normals, normals);
      _normals[i] = normals;
      vertexData.components.normal = this._checkComponentNumber(normalsAccessorStr, json, gl);
      vertexData.componentBytes.normal = this._checkBytesPerComponent(normalsAccessorStr, json, gl);
      vertexData.componentType.normal = this._getDataType(normalsAccessorStr, json, gl);
      dataViewMethodDic.normal = this._checkDataViewMethod(normalsAccessorStr, json, gl);

      /// if Skeletal
      let jointAccessorStr = primitiveJson.attributes.JOINT;
      if (jointAccessorStr) {
        let joints = this._accessBinary(jointAccessorStr, json, arrayBuffer, 1.0, gl, false, true);
        additional['joint'][i] = joints;
        vertexData.components.joint = this._checkComponentNumber(jointAccessorStr, json, gl);
        vertexData.componentBytes.joint = this._checkBytesPerComponent(jointAccessorStr, json, gl);
        vertexData.componentType.joint = this._getDataType(jointAccessorStr, json, gl);
        dataViewMethodDic.joint = this._checkDataViewMethod(jointAccessorStr, json, gl);
      }
      let weightAccessorStr = primitiveJson.attributes.WEIGHT;
      if (weightAccessorStr) {
        let weights = this._accessBinary(weightAccessorStr, json, arrayBuffer, 1.0, gl, false, true);
        additional['weight'][i] = weights;
        vertexData.components.weight = this._checkComponentNumber(weightAccessorStr, json, gl);
        vertexData.componentBytes.weight = this._checkBytesPerComponent(weightAccessorStr, json, gl);
        vertexData.componentType.weight = this._getDataType(weightAccessorStr, json, gl);
        dataViewMethodDic.weight = this._checkDataViewMethod(weightAccessorStr, json, gl);
      }

      // Texture
      let texcoords0AccessorStr = primitiveJson.attributes.TEXCOORD_0;
      var texcoords = null;

      let material = glBoostContext.createClassicMaterial(canvas);

      let materialStr = primitiveJson.material;

      texcoords = this._loadMaterial(glBoostContext, gl, basePath, arrayBuffer, json, vertexData, indices, material, materialStr, positions, dataViewMethodDic, additional, texcoords, texcoords0AccessorStr, geometry, defaultShader, shaders, i);

      materials.push(material);

    }

    if (meshJson.primitives.length > 1) {
      let lengthDic = {index: 0, position: 0, normal: 0, joint: 0, weight: 0, texcoord: 0};
      for (let i = 0; i < meshJson.primitives.length; i++) {
        //lengthDic.index += _indicesArray[i].length;
        lengthDic.position += _positions[i].length;
        lengthDic.normal += _normals[i].length;
        if (typeof additional['joint'][i] !== 'undefined') {
          lengthDic.joint += additional['joint'][i].length;
        }
        if (typeof additional['weight'][i] !== 'undefined') {
          lengthDic.weight += additional['weight'][i].length;
        }
        if (typeof additional['texcoord'][i] !== 'undefined') {
          lengthDic.texcoord += additional['texcoord'][i].length;
        }
      }

      function getTypedArray(dataViewMethod, length) {
        let vertexAttributeArray = null;
        if (dataViewMethod === 'getInt8') {
          vertexAttributeArray = new Int8Array(length);
        } else if (dataViewMethod === 'getUint8') {
          vertexAttributeArray = new Uint8Array(length);
        } else if (dataViewMethod === 'getInt16') {
          vertexAttributeArray = new Int16Array(length);
        } else if (dataViewMethod === 'getUint16') {
          vertexAttributeArray = new Uint16Array(length);
        } else if (dataViewMethod === 'getInt32') {
          vertexAttributeArray = new Int32Array(length);
        } else if (dataViewMethod === 'getUint32') {
          vertexAttributeArray = new Uint32Array(length);
        } else if (dataViewMethod === 'getFloat32') {
          vertexAttributeArray = new Float32Array(length);
        }

        return vertexAttributeArray;
      }

      for (let attribName in dataViewMethodDic) {
        let newTypedArray = getTypedArray(dataViewMethodDic[attribName], lengthDic[attribName]);
        let offset = 0;
        for (let i = 0; i < meshJson.primitives.length; i++) {

          let array = null;

          if (attribName === 'position') {
            array = _positions[i];
          } else if (attribName === 'normal') {
            array = _normals[i];
          } else if (attribName === 'joint') {
            array = additional['joint'][i];
          } else if (attribName === 'weight') {
            array = additional['weight'][i];
          } else if (attribName === 'texcoord') {
            array = additional['texcoord'][i];
          }

          newTypedArray.set(array, offset);
          offset += array.length;
        }

        if (attribName === 'position') {
          vertexData.position = newTypedArray;
        } else if (attribName === 'normal') {
          vertexData.normal = newTypedArray;
        } else if (attribName === 'joint') {
          additional['joint'] = newTypedArray;
        } else if (attribName === 'weight') {
          additional['weight'] = newTypedArray;
        } else if (attribName === 'texcoord') {
          additional['texcoord'] = newTypedArray;
        }
      }


    } else {
      vertexData.position = _positions[0];
      vertexData.normal = _normals[0];
      additional['joint'] = additional['joint'][0];
      additional['weight'] = additional['weight'][0];
      additional['texcoord'] = additional['texcoord'][0];
    }

    if (typeof additional['joint'] === 'undefined' || additional['joint'].length === 0) {
      delete additional['joint'];
    }
    if (typeof additional['weight'] === 'undefined' || additional['weight'].length === 0) {
      delete additional['weight'];
    }
    if (typeof additional['texcoord'] === 'undefined' || additional['texcoord'].length === 0) {
      delete additional['texcoord'];
    }


    if (_indicesArray.length === 0) {
      _indicesArray = null;
    }

    geometry.setVerticesData(ArrayUtil.merge(vertexData, additional), _indicesArray);
    geometry.materials = materials;

    return mesh;
  }

  _loadMaterial(glBoostContext, gl, basePath, arrayBuffer, json, vertexData, indices, material, materialStr, positions, dataViewMethodDic, additional, texcoords, texcoords0AccessorStr, geometry, defaultShader, shaders, idx) {
    let materialJson = json.materials[materialStr];

    if (typeof materialJson.extensions !== 'undefined' && typeof materialJson.extensions.KHR_materials_common !== 'undefined') {
      materialJson = materialJson.extensions.KHR_materials_common;
    }

    let diffuseValue = materialJson.values.diffuse;
    // Diffuse Texture
    if (texcoords0AccessorStr) {
      texcoords = this._accessBinary(texcoords0AccessorStr, json, arrayBuffer, 1.0, gl, false, true);
      additional['texcoord'][idx] = texcoords;
      vertexData.components.texcoord = this._checkComponentNumber(texcoords0AccessorStr, json, gl);
      vertexData.componentBytes.texcoord = this._checkBytesPerComponent(texcoords0AccessorStr, json, gl);
      vertexData.componentType.texcoord = this._getDataType(texcoords0AccessorStr, json, gl);
      dataViewMethodDic.texcoord = this._checkDataViewMethod(texcoords0AccessorStr, json, gl);

      for (let valueName in materialJson.values) {
        let value = materialJson.values[valueName];
        if (typeof value === 'string') {
          let textureStr = value;
          let textureJson = json.textures[textureStr];
          let imageStr = textureJson.source;
          let imageJson = json.images[imageStr];

          let textureUri = null;

          if (typeof imageJson.extensions !== 'undefined' && typeof imageJson.extensions.KHR_binary_glTF !== 'undefined') {
            textureUri = this._accessBinaryAsImage(imageJson.extensions.KHR_binary_glTF.bufferView, json, arrayBuffer, imageJson.extensions.KHR_binary_glTF.mimeType);
          } else {
            let imageFileStr = imageJson.uri;
            if (imageFileStr.match(/^data:/)) {
              textureUri = imageFileStr;
            } else {
              textureUri = basePath + imageFileStr;
            }
          }

          let samplerStr = textureJson.sampler;
          let samplerJson = json.samplers[samplerStr];

          let texture = glBoostContext.createTexture(textureUri, textureStr, {
            'TEXTURE_MAG_FILTER': samplerJson.magFilter,
            'TEXTURE_MIN_FILTER': samplerJson.minFilter,
            'TEXTURE_WRAP_S': samplerJson.wrapS,
            'TEXTURE_WRAP_T': samplerJson.wrapT
          });
          material.setTexture(texture);
        }
      }
    } else {
      if (typeof vertexData.components.texcoord !== 'undefined') {
        // If texture coordinates existed even once in the previous loop
        let emptyTexcoords = [];
        let componentN = vertexData.components.position;
        let length = positions.length / componentN;
        for (let k = 0; k < length; k++) {
          emptyTexcoords.push(0);
          emptyTexcoords.push(0);
        }
        additional['texcoord'][idx] = new Float32Array(emptyTexcoords);
        vertexData.components.texcoord = 2;
        vertexData.componentBytes.texcoord = 4;
        dataViewMethodDic.texcoord = 'getFloat32';
      }
    }

    for (let valueName in materialJson.values) {
      let value = materialJson.values[valueName];
      if (typeof value !== 'string') {
        material[valueName + 'Color'] = new Vector4(value[0], value[1], value[2], value[3]);
      }
    }

    let opacityValue = 1.0 - materialJson.values.transparency;

    if (indices !== null) {
      material.setVertexN(geometry, indices.length);
    }

    let techniqueStr = materialJson.technique;
    if (defaultShader) {
      material.shaderClass = defaultShader;
    } else {
      if (typeof json.techniques !== 'undefined') {
        this._loadTechnique(glBoostContext, json, techniqueStr, material, materialJson, shaders);
      } else {
        material.shaderClass = PhongShader;
      }
    }

    return texcoords;
  }

  _loadTechnique(glBoostContext, json, techniqueStr, material, materialJson, shaders) {
    let techniqueJson = json.techniques[techniqueStr];


    let programStr = techniqueJson.program;
    let uniformsJson = techniqueJson.uniforms;
    let parametersJson = techniqueJson.parameters;
    let attributesJson = techniqueJson.attributes;
    let attributes = {};
    for (let attributeName in attributesJson) {
      //attributes[attributesJson[attributeName]] = attributeName;
      let parameterName = attributesJson[attributeName];
      let parameterJson = parametersJson[parameterName];
      attributes[attributeName] = parameterJson.semantic;
    }

    let uniforms = {};
    let textureNames = {};
    for (let uniformName in uniformsJson) {
      let parameterName = uniformsJson[uniformName];
      let parameterJson = parametersJson[parameterName];
      if (typeof parameterJson.semantic !== 'undefined') {
        uniforms[uniformName] = parameterJson.semantic;
      } else {
        let value = null;
        if (typeof parameterJson.value !== 'undefined') {
          value = parameterJson.value;
        } else {
          value = materialJson.values[parameterName];
        }

        switch (parameterJson.type) {
          case 5126:
            uniforms[uniformName] = value;
            break;
          case 35664:
            uniforms[uniformName] = new Vector2(value[0], value[1]);
            break;
          case 35665:
            uniforms[uniformName] = new Vector3(value[0], value[1], value[2]);
            break;
          case 35666:
            uniforms[uniformName] = new Vector4(value[0], value[1], value[2], value[3]);
            break;
          case 5124:
            uniforms[uniformName] = value;
            break;
          case 35667:
            uniforms[uniformName] = new Vector2(value[0], value[1]);
            break;
          case 35668:
            uniforms[uniformName] = new Vector3(value[0], value[1], value[2]);
            break;
          case 35669:
            uniforms[uniformName] = new Vector4(value[0], value[1], value[2], value[3]);
            break;
          case 35678:
            uniforms[uniformName] = 'TEXTURE';
            textureNames[uniformName] =  materialJson.values[parameterName];
            break;
        }
      }
    }

    this._loadProgram(glBoostContext, json, programStr, material, shaders, attributes, uniforms, textureNames);
  }



  _loadProgram(glBoostContext, json, programStr, material, shaders, attributes, uniforms, textureNames) {
    let programJson = json.programs[programStr];
    let fragmentShaderStr = programJson.fragmentShader;
    let vertexShaderStr = programJson.vertexShader;
    let fragmentShaderText = shaders[fragmentShaderStr].shaderText;
    let vertexShaderText = shaders[vertexShaderStr].shaderText;

    material.shaderInstance = new FreeShader(glBoostContext, vertexShaderText, fragmentShaderText, attributes, uniforms, textureNames);
  }

  _loadAnimation(element, arrayBuffer, json, canvas, scale) {
    let animationJson = null;
    for (let anim in json.animations) {
      animationJson = json.animations[anim];
      if (animationJson) {
        for (let i = 0; i < animationJson.channels.length; i++) {
          let channelJson = animationJson.channels[i];
          if (!channelJson) {
            continue;
          }

          let targetMeshStr = channelJson.target.id;
          let targetPathStr = channelJson.target.path;
          let samplerStr = channelJson.sampler;
          let samplerJson = animationJson.samplers[samplerStr];
          let animInputStr = samplerJson.input;
          var animOutputStr = samplerJson.output;
          let animInputAccessorStr = animationJson.parameters[animInputStr];
          let animOutputAccessorStr = animationJson.parameters[animOutputStr];

          let gl = GLContext.getInstance(canvas).gl;
          var animInputArray = this._accessBinary(animInputAccessorStr, json, arrayBuffer, 1.0, gl);
          let animOutputArray = null;
          if (animOutputStr === 'translation') {
            animOutputArray = this._accessBinary(animOutputAccessorStr, json, arrayBuffer, scale, gl);
          } else if (animOutputStr === 'rotation') {
            animOutputArray = this._accessBinary(animOutputAccessorStr, json, arrayBuffer, 1.0, gl, true);
          } else {
            animOutputArray = this._accessBinary(animOutputAccessorStr, json, arrayBuffer, 1.0, gl);
          }

          let animationAttributeName = '';
          if (animOutputStr === 'translation') {
            animationAttributeName = 'translate';
          } else if (animOutputStr === 'rotation') {
            animationAttributeName = 'quaternion';
          } else {
            animationAttributeName = animOutputStr;
          }

          let hitElement = element.searchElement(targetMeshStr);
          if (hitElement) {
            hitElement.setAnimationAtLine('time', animationAttributeName, animInputArray, animOutputArray);
            hitElement.setActiveAnimationLine('time');
            hitElement.currentCalcMode = 'quaternion';
          }
        }
      }
    }
  }
  _accessBinaryAsShader(bufferViewStr, json, arrayBuffer) {
    let bufferViewJson = json.bufferViews[bufferViewStr];
    let byteOffset = bufferViewJson.byteOffset;
    let byteLength = bufferViewJson.byteLength;


    let arrayBufferSliced = arrayBuffer.slice(byteOffset, byteOffset + byteLength);

    return DataUtil.arrayBufferToString(arrayBufferSliced);
  }

  _accessBinaryAsImage(bufferViewStr, json, arrayBuffer, mimeType) {
    let bufferViewJson = json.bufferViews[bufferViewStr];
    let byteOffset = bufferViewJson.byteOffset;
    let byteLength = bufferViewJson.byteLength;


    let arrayBufferSliced = arrayBuffer.slice(byteOffset, byteOffset + byteLength);
    let bytes = new Uint8Array(arrayBufferSliced);
    let binaryData = '';
    for (let i = 0, len = bytes.byteLength; i < len; i++) {
      binaryData += String.fromCharCode(bytes[i]);
    }
    let imgSrc = '';
    if (mimeType == 'image/jpeg') {
      imgSrc = "data:image/jpeg;base64,";
    } else if (mimeType == 'image/png') {
      imgSrc = "data:image/png;base64,";
    } else if (mimeType == 'image/gif') {
      imgSrc = "data:image/gif;base64,";
    } else if (mimeType == 'image/bmp') {
      imgSrc = "data:image/bmp;base64,";
    } else {
      imgSrc = "data:image/unknown;base64,";
    }
    let dataUrl = imgSrc + window.btoa(binaryData);

    return dataUrl;
  }


  static _isSystemLittleEndian() {
    return !!(new Uint8Array((new Uint16Array([0x00ff])).buffer))[0];
  }

  _checkComponentNumber(accessorStr, json, gl) {
    var accessorJson = json.accessors[accessorStr];

    var componentN = 0;
    switch (accessorJson.type) {
      case 'SCALAR':
        componentN = 1;
        break;
      case 'VEC2':
        componentN = 2;
        break;
      case 'VEC3':
        componentN = 3;
        break;
      case 'VEC4':
        componentN = 4;
        break;
      case 'MAT4':
        componentN = 16;
        break;
    }

    return componentN;
  }

  _checkBytesPerComponent(accessorStr, json, gl) {
    var accessorJson = json.accessors[accessorStr];;

    var bytesPerComponent = 0;
    switch (accessorJson.componentType) {
      case gl.BYTE:
        bytesPerComponent = 1;
        break;
      case gl.UNSIGNED_BYTE:
        bytesPerComponent = 1;
        break;
      case gl.SHORT:
        bytesPerComponent = 2;
        break;
      case gl.UNSIGNED_SHORT:
        bytesPerComponent = 2;
        break;
      case gl.INT:
        bytesPerComponent = 4;
        break;
      case gl.UNSIGNED_INT:
        bytesPerComponent = 4;
        break;
      case gl.FLOAT:
        bytesPerComponent = 4;
        break;
      default:
        break;
    }
    return bytesPerComponent;
  }

  _checkDataViewMethod(accessorStr, json, gl) {
    var accessorJson = json.accessors[accessorStr];
    var dataViewMethod = '';
    switch (accessorJson.componentType) {
      case gl.BYTE:
        dataViewMethod = 'getInt8';
        break;
      case gl.UNSIGNED_BYTE:
        dataViewMethod = 'getUint8';
        break;
      case gl.SHORT:
        dataViewMethod = 'getInt16';
        break;
      case gl.UNSIGNED_SHORT:
        dataViewMethod = 'getUint16';
        break;
      case gl.INT:
        dataViewMethod = 'getInt33';
        break;
      case gl.UNSIGNED_INT:
        dataViewMethod = 'getUint33';
        break;
      case gl.FLOAT:
        dataViewMethod = 'getFloat32';
        break;
      default:
        break;
    }
    return dataViewMethod;
  }

  _getDataType(accessorStr, json, gl) {
    var accessorJson = json.accessors[accessorStr];
    return accessorJson.componentType;
  }

  _accessBinary(accessorStr, json, arrayBuffer, scale, gl, quaternionIfVec4 = false, toGetAsTypedArray = false) {
    var accessorJson = json.accessors[accessorStr];
    var bufferViewStr = accessorJson.bufferView;
    var bufferViewJson = json.bufferViews[bufferViewStr];
    var byteOffset = bufferViewJson.byteOffset + accessorJson.byteOffset;

    let componentN = this._checkComponentNumber(accessorStr, json, gl);
    let bytesPerComponent = this._checkBytesPerComponent(accessorStr, json, gl);
    var dataViewMethod = this._checkDataViewMethod(accessorStr, json, gl);


    var byteLength = bytesPerComponent * componentN * accessorJson.count;

    var vertexAttributeArray = [];

    if (toGetAsTypedArray) {
      if (GLTFLoader._isSystemLittleEndian()) {
        if (dataViewMethod === 'getFloat32') {
          vertexAttributeArray = new Float32Array(arrayBuffer, byteOffset, byteLength / bytesPerComponent);
        } else if (dataViewMethod === 'getInt8') {
          vertexAttributeArray = new Int8Array(arrayBuffer, byteOffset, byteLength / bytesPerComponent);
        } else if (dataViewMethod === 'getUint8') {
          vertexAttributeArray = new Uint8Array(arrayBuffer, byteOffset, byteLength / bytesPerComponent);
        } else if (dataViewMethod === 'getInt16') {
          vertexAttributeArray = new Int16Array(arrayBuffer, byteOffset, byteLength / bytesPerComponent);
        } else if (dataViewMethod === 'getUint16') {
          vertexAttributeArray = new Uint16Array(arrayBuffer, byteOffset, byteLength / bytesPerComponent);
        } else if (dataViewMethod === 'getInt32') {
          vertexAttributeArray = new Int32Array(arrayBuffer, byteOffset, byteLength / bytesPerComponent);
        } else if (dataViewMethod === 'getUint32') {
          vertexAttributeArray = new Uint32Array(arrayBuffer, byteOffset, byteLength / bytesPerComponent);
        }

      } else {
        let dataView = new DataView(arrayBuffer, byteOffset, byteLength);
        let byteDelta = bytesPerComponent * componentN;
        let littleEndian = true;
        for (let pos = 0; pos < byteLength; pos += byteDelta) {
          switch (accessorJson.type) {
            case 'SCALAR':
              vertexAttributeArray.push(dataView[dataViewMethod](pos, littleEndian));
              break;
            case 'VEC2':
              vertexAttributeArray.push(dataView[dataViewMethod](pos, littleEndian) * scale);
              vertexAttributeArray.push(dataView[dataViewMethod](pos + bytesPerComponent, littleEndian) * scale);
              break;
            case 'VEC3':
              vertexAttributeArray.push(dataView[dataViewMethod](pos, littleEndian) * scale);
              vertexAttributeArray.push(dataView[dataViewMethod](pos + bytesPerComponent, littleEndian) * scale);
              vertexAttributeArray.push(dataView[dataViewMethod](pos + bytesPerComponent * 2, littleEndian) * scale);
              break;
            case 'VEC4':
              vertexAttributeArray.push(dataView[dataViewMethod](pos, littleEndian) * scale);
              vertexAttributeArray.push(dataView[dataViewMethod](pos + bytesPerComponent, littleEndian) * scale);
              vertexAttributeArray.push(dataView[dataViewMethod](pos + bytesPerComponent * 2, littleEndian) * scale);
              vertexAttributeArray.push(dataView[dataViewMethod](pos + bytesPerComponent * 3, littleEndian) * scale);
              break;
          }
        }
        if (dataViewMethod === 'getInt8') {
          vertexAttributeArray = new Int8Array(vertexAttributeArray);
        } else if (dataViewMethod === 'getUint8') {
          vertexAttributeArray = new Uint8Array(vertexAttributeArray);
        } else if (dataViewMethod === 'getInt16') {
          vertexAttributeArray = new Int16Array(vertexAttributeArray);
        } else if (dataViewMethod === 'getUint16') {
          vertexAttributeArray = new Uint16Array(vertexAttributeArray);
        } else if (dataViewMethod === 'getInt32') {
          vertexAttributeArray = new Int32Array(vertexAttributeArray);
        } else if (dataViewMethod === 'getUint32') {
          vertexAttributeArray = new Uint32Array(vertexAttributeArray);
        } else if (dataViewMethod === 'getFloat32') {
          vertexAttributeArray = new Float32Array(vertexAttributeArray);
        }
      }
    } else {
      let dataView = new DataView(arrayBuffer, byteOffset, byteLength);
      let byteDelta = bytesPerComponent * componentN;
      let littleEndian = true;
      for (let pos = 0; pos < byteLength; pos += byteDelta) {

        switch (accessorJson.type) {
          case 'SCALAR':
            vertexAttributeArray.push(dataView[dataViewMethod](pos, littleEndian));
            break;
          case 'VEC2':
            vertexAttributeArray.push(new Vector2(
              dataView[dataViewMethod](pos, littleEndian)*scale,
              dataView[dataViewMethod](pos+bytesPerComponent, littleEndian)*scale
            ));
            break;
          case 'VEC3':
            vertexAttributeArray.push(new Vector3(
              dataView[dataViewMethod](pos, littleEndian)*scale,
              dataView[dataViewMethod](pos+bytesPerComponent, littleEndian)*scale,
              dataView[dataViewMethod](pos+bytesPerComponent*2, littleEndian)*scale
            ));
            break;
          case 'VEC4':
            if (quaternionIfVec4) {
              vertexAttributeArray.push(new Quaternion(
                dataView[dataViewMethod](pos, littleEndian),
                dataView[dataViewMethod](pos+bytesPerComponent, littleEndian),
                dataView[dataViewMethod](pos+bytesPerComponent*2, littleEndian),
                dataView[dataViewMethod](pos+bytesPerComponent*3, littleEndian)
              ));
            } else {
              vertexAttributeArray.push(new Vector4(
                dataView[dataViewMethod](pos, littleEndian)*scale,
                dataView[dataViewMethod](pos+bytesPerComponent, littleEndian)*scale,
                dataView[dataViewMethod](pos+bytesPerComponent*2, littleEndian)*scale,
                dataView[dataViewMethod](pos+bytesPerComponent*3, littleEndian)
              ));
            }
            break;
          case 'MAT4':
            let matrixComponents = [];
            for (let i=0; i<16; i++) {
              matrixComponents[i] = dataView[dataViewMethod](pos+bytesPerComponent*i, littleEndian)*scale;
            }
            vertexAttributeArray.push(new Matrix44(matrixComponents, true));
            break;
        }

      }
    }


    return vertexAttributeArray;
  }

}



GLBoost["GLTFLoader"] = GLTFLoader;
