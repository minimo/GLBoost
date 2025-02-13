import GLBoost from '../../globals';
import Vector4 from './Vector4';
import Matrix33 from './Matrix33';
import MathUtil from './MathUtil';


export default class Matrix44 {

  constructor(m, isColumnMajor = false) {
    this.m = new Float32Array(16);
    if (arguments.length >= 16) {
      if (isColumnMajor === true) {
        let m = arguments;
        this.setComponents(
          m[0], m[4], m[8], m[12],
          m[1], m[5], m[9], m[13],
          m[2], m[6], m[10], m[14],
          m[3], m[7], m[11], m[15]);
      } else {
        this.setComponents.apply(this, arguments);  // arguments[0-15] must be row major values if isColumnMajor is false
      }
    } else if (Array.isArray(m)) {
      if (isColumnMajor === true) {
        this.setComponents(
          m[0], m[4], m[8], m[12],
          m[1], m[5], m[9], m[13],
          m[2], m[6], m[10], m[14],
          m[3], m[7], m[11], m[15]);
      } else {
        this.setComponents.apply(this, m); // 'm' must be row major array if isColumnMajor is false
      }
    } else if (m instanceof Float32Array) {
      if (isColumnMajor === true) {
        this.setComponents(
          m[0], m[4], m[8], m[12],
          m[1], m[5], m[9], m[13],
          m[2], m[6], m[10], m[14],
          m[3], m[7], m[11], m[15]);
      } else {
        this.setComponents.apply(this, m); // 'm' must be row major array if isColumnMajor is false
      }
    } else {
      this.identity();
    }
  }

  setComponents(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    this.m00 = m00; this.m01 = m01; this.m02 = m02; this.m03 = m03;
    this.m10 = m10; this.m11 = m11; this.m12 = m12; this.m13 = m13;
    this.m20 = m20; this.m21 = m21; this.m22 = m22; this.m23 = m23;
    this.m30 = m30; this.m31 = m31; this.m32 = m32; this.m33 = m33;

    return this;
  }

  clone() {
    return new Matrix44(
      this.m[0], this.m[4], this.m[8], this.m[12],
      this.m[1], this.m[5], this.m[9], this.m[13],
      this.m[2], this.m[6], this.m[10], this.m[14],
      this.m[3], this.m[7], this.m[11], this.m[15]
    );
  }

  /**
   * 単位行列にする
   */
  identity() {
    this.setComponents(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    return this;
  }

  /**
   * 単位行列にする（static版）
   */
  static identity() {
    return new Matrix44(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
  }

  translate(vec) {
    return this.setComponents(
      1, 0, 0, vec.x,
      0, 1, 0, vec.y,
      0, 0, 1, vec.z,
      0, 0, 0, 1
    );
  }

  static translate(vec) {
    return new Matrix44(
      1, 0, 0, vec.x,
      0, 1, 0, vec.y,
      0, 0, 1, vec.z,
      0, 0, 0, 1
    );
  }

  scale(vec) {
    return this.setComponents(
      vec.x, 0, 0, 0,
      0, vec.y, 0, 0,
      0, 0, vec.z, 0,
      0, 0, 0, 1
    );
  }

  static scale(vec) {
    return new Matrix44(
      vec.x, 0, 0, 0,
      0, vec.y, 0, 0,
      0, 0, vec.z, 0,
      0, 0, 0, 1
    );
  }

  /**
   * Create X oriented Rotation Matrix
   */
  rotateX(angle) {
    var radian = 0;
    if (GLBoost["VALUE_ANGLE_UNIT"] === GLBoost.DEGREE) {
      radian = MathUtil.degreeToRadian(angle);
    } else {
      radian = angle;
    }

    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    return this.setComponents(
      1, 0, 0, 0,
      0, cos, -sin, 0,
      0, sin, cos, 0,
      0, 0, 0, 1
    );
  }
  /**
   * Create X oriented Rotation Matrix
  */
  static rotateX(angle) {
    var radian = 0;
    if (GLBoost["VALUE_ANGLE_UNIT"] === GLBoost.DEGREE) {
      radian = MathUtil.degreeToRadian(angle);
    } else {
      radian = angle;
    }

    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    return new Matrix44(
      1, 0, 0, 0,
      0, cos, -sin, 0,
      0, sin, cos, 0,
      0, 0, 0, 1
    );
  }

  /**
   * Create Y oriented Rotation Matrix
   */
  rotateY(angle) {
    var radian = 0;
    if (GLBoost["VALUE_ANGLE_UNIT"] === GLBoost.DEGREE) {
      radian = MathUtil.degreeToRadian(angle);
    } else {
      radian = angle;
    }

    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    return this.setComponents(
      cos, 0, sin, 0,
      0, 1, 0, 0,
      -sin, 0, cos, 0,
      0, 0, 0, 1
    );
  }
  /**
   * Create Y oriented Rotation Matrix
   */
  static rotateY(angle) {
    var radian = 0;
    if (GLBoost["VALUE_ANGLE_UNIT"] === GLBoost.DEGREE) {
      radian = MathUtil.degreeToRadian(angle);
    } else {
      radian = angle;
    }

    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    return new Matrix44(
      cos, 0, sin, 0,
      0, 1, 0, 0,
      -sin, 0, cos, 0,
      0, 0, 0, 1
    );
  }

  /**
   * Create Z oriented Rotation Matrix
   */
  rotateZ(angle) {
    var radian = 0;
    if (GLBoost["VALUE_ANGLE_UNIT"] === GLBoost.DEGREE) {
      radian = MathUtil.degreeToRadian(angle);
    } else {
      radian = angle;
    }

    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    return this.setComponents(
      cos, -sin, 0, 0,
      sin, cos, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
  }
  /**
   * Create Z oriented Rotation Matrix
   */
  static rotateZ(angle) {
    var radian = 0;
    if (GLBoost["VALUE_ANGLE_UNIT"] === GLBoost.DEGREE) {
      radian = MathUtil.degreeToRadian(angle);
    } else {
      radian = angle;
    }

    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    return new Matrix44(
      cos, -sin, 0, 0,
      sin, cos, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
  }

  /**
   * ゼロ行列
   */
  zero() {
    this.setComponents(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    return this;
  }

  static zero() {
    return new Matrix44(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }

  flatten() {
    return this.m;
  }

  flattenAsArray() {
    return [this.m[0], this.m[1], this.m[2], this.m[3],
      this.m[4], this.m[5], this.m[6], this.m[7],
      this.m[8], this.m[9], this.m[10], this.m[11],
      this.m[12], this.m[13], this.m[14], this.m[15]];
  }

  _swap(l, r) {
    this.m[r] = [this.m[l], this.m[l] = this.m[r]][0]; // Swap
  }

  /**
   * 転置
   */
  transpose() {
    this._swap(1, 4);
    this._swap(2, 8);
    this._swap(3, 12);
    this._swap(6, 9);
    this._swap(7, 13);
    this._swap(11, 14);

    return this;
  }

  /**
   * 転置（static版）
   */
  static transpose(mat) {

    var mat_t = new Matrix44(
      mat.m00, mat.m10, mat.m20, mat.m30,
      mat.m01, mat.m11, mat.m21, mat.m31,
      mat.m02, mat.m12, mat.m22, mat.m32,
      mat.m03, mat.m13, mat.m23, mat.m33
    );

    return mat_t;
  }

  multiplyVector(vec) {
    var x = this.m00*vec.x + this.m01*vec.y + this.m02*vec.z + this.m03*vec.w;
    var y = this.m10*vec.x + this.m11*vec.y + this.m12*vec.z + this.m13*vec.w;
    var z = this.m20*vec.x + this.m21*vec.y + this.m22*vec.z + this.m23*vec.w;
    var w = this.m30*vec.x + this.m31*vec.y + this.m32*vec.z + this.m33*vec.w;

    return new Vector4(x, y, z, w);
  }

  /**
   * 行列同士の乗算
   */
  multiply(mat) {
    var m00 = this.m00*mat.m00 + this.m01*mat.m10 + this.m02*mat.m20 + this.m03*mat.m30;
    var m01 = this.m00*mat.m01 + this.m01*mat.m11 + this.m02*mat.m21 + this.m03*mat.m31;
    var m02 = this.m00*mat.m02 + this.m01*mat.m12 + this.m02*mat.m22 + this.m03*mat.m32;
    var m03 = this.m00*mat.m03 + this.m01*mat.m13 + this.m02*mat.m23 + this.m03*mat.m33;

    var m10 = this.m10*mat.m00 + this.m11*mat.m10 + this.m12*mat.m20 + this.m13*mat.m30;
    var m11 = this.m10*mat.m01 + this.m11*mat.m11 + this.m12*mat.m21 + this.m13*mat.m31;
    var m12 = this.m10*mat.m02 + this.m11*mat.m12 + this.m12*mat.m22 + this.m13*mat.m32;
    var m13 = this.m10*mat.m03 + this.m11*mat.m13 + this.m12*mat.m23 + this.m13*mat.m33;

    var m20 = this.m20*mat.m00 + this.m21*mat.m10 + this.m22*mat.m20 + this.m23*mat.m30;
    var m21 = this.m20*mat.m01 + this.m21*mat.m11 + this.m22*mat.m21 + this.m23*mat.m31;
    var m22 = this.m20*mat.m02 + this.m21*mat.m12 + this.m22*mat.m22 + this.m23*mat.m32;
    var m23 = this.m20*mat.m03 + this.m21*mat.m13 + this.m22*mat.m23 + this.m23*mat.m33;

    var m30 = this.m30*mat.m00 + this.m31*mat.m10 + this.m32*mat.m20 + this.m33*mat.m30;
    var m31 = this.m30*mat.m01 + this.m31*mat.m11 + this.m32*mat.m21 + this.m33*mat.m31;
    var m32 = this.m30*mat.m02 + this.m31*mat.m12 + this.m32*mat.m22 + this.m33*mat.m32;
    var m33 = this.m30*mat.m03 + this.m31*mat.m13 + this.m32*mat.m23 + this.m33*mat.m33;

    return this.setComponents(
        m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33
    );
  }

  /**
   * 行列同士の乗算（static版）
   */
  static multiply(l_m, r_m) {
    var m00 = l_m.m00*r_m.m00 + l_m.m01*r_m.m10 + l_m.m02*r_m.m20 + l_m.m03*r_m.m30;
    var m10 = l_m.m10*r_m.m00 + l_m.m11*r_m.m10 + l_m.m12*r_m.m20 + l_m.m13*r_m.m30;
    var m20 = l_m.m20*r_m.m00 + l_m.m21*r_m.m10 + l_m.m22*r_m.m20 + l_m.m23*r_m.m30;
    var m30 = l_m.m30*r_m.m00 + l_m.m31*r_m.m10 + l_m.m32*r_m.m20 + l_m.m33*r_m.m30;

    var m01 = l_m.m00*r_m.m01 + l_m.m01*r_m.m11 + l_m.m02*r_m.m21 + l_m.m03*r_m.m31;
    var m11 = l_m.m10*r_m.m01 + l_m.m11*r_m.m11 + l_m.m12*r_m.m21 + l_m.m13*r_m.m31;
    var m21 = l_m.m20*r_m.m01 + l_m.m21*r_m.m11 + l_m.m22*r_m.m21 + l_m.m23*r_m.m31;
    var m31 = l_m.m30*r_m.m01 + l_m.m31*r_m.m11 + l_m.m32*r_m.m21 + l_m.m33*r_m.m31;

    var m02 = l_m.m00*r_m.m02 + l_m.m01*r_m.m12 + l_m.m02*r_m.m22 + l_m.m03*r_m.m32;
    var m12 = l_m.m10*r_m.m02 + l_m.m11*r_m.m12 + l_m.m12*r_m.m22 + l_m.m13*r_m.m32;
    var m22 = l_m.m20*r_m.m02 + l_m.m21*r_m.m12 + l_m.m22*r_m.m22 + l_m.m23*r_m.m32;
    var m32 = l_m.m30*r_m.m02 + l_m.m31*r_m.m12 + l_m.m32*r_m.m22 + l_m.m33*r_m.m32;

    var m03 = l_m.m00*r_m.m03 + l_m.m01*r_m.m13 + l_m.m02*r_m.m23 + l_m.m03*r_m.m33;
    var m13 = l_m.m10*r_m.m03 + l_m.m11*r_m.m13 + l_m.m12*r_m.m23 + l_m.m13*r_m.m33;
    var m23 = l_m.m20*r_m.m03 + l_m.m21*r_m.m13 + l_m.m22*r_m.m23 + l_m.m23*r_m.m33;
    var m33 = l_m.m30*r_m.m03 + l_m.m31*r_m.m13 + l_m.m32*r_m.m23 + l_m.m33*r_m.m33;

    return new Matrix44(
        m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33
    );
  }

  toMatrix33() {
    return new Matrix33(
      this.m00, this.m01, this.m02,
      this.m10, this.m11, this.m12,
      this.m20, this.m21, this.m22
    );
  }

  static toMatrix33(mat) {
    return new Matrix33(
      mat.m00, mat.m01, mat.m02,
      mat.m10, mat.m11, mat.m12,
      mat.m20, mat.m21, mat.m22
    );
  }

  determinant() {
    return this.m00*this.m11*this.m22*this.m33 + this.m00*this.m12*this.m23*this.m31 + this.m00*this.m13*this.m21*this.m32 +
      this.m01*this.m10*this.m23*this.m32 + this.m01*this.m12*this.m20*this.m33 + this.m01*this.m13*this.m22*this.m30 +
      this.m02*this.m10*this.m21*this.m33 + this.m02*this.m11*this.m23*this.m30 + this.m02*this.m13*this.m20*this.m31 +
      this.m03*this.m10*this.m22*this.m31 + this.m03*this.m11*this.m20*this.m32 + this.m03*this.m12*this.m21*this.m30 -

      this.m00*this.m11*this.m23*this.m32 - this.m00*this.m12*this.m21*this.m33 - this.m00*this.m13*this.m22*this.m31 -
      this.m01*this.m10*this.m22*this.m33 - this.m01*this.m12*this.m23*this.m30 - this.m01*this.m13*this.m20*this.m32 -
      this.m02*this.m10*this.m23*this.m31 - this.m02*this.m11*this.m20*this.m33 - this.m02*this.m13*this.m21*this.m30 -
      this.m03*this.m10*this.m21*this.m32 - this.m03*this.m11*this.m22*this.m30 - this.m03*this.m12*this.m20*this.m31;
  }

  static determinant(mat) {
    return mat.m00*mat.m11*mat.m22*mat.m33 + mat.m00*mat.m12*mat.m23*mat.m31 + mat.m00*mat.m13*mat.m21*mat.m32 +
      mat.m01*mat.m10*mat.m23*mat.m32 + mat.m01*mat.m12*mat.m20*mat.m33 + mat.m01*mat.m13*mat.m22*mat.m30 +
      mat.m02*mat.m10*mat.m21*mat.m33 + mat.m02*mat.m11*mat.m23*mat.m30 + mat.m02*mat.m13*mat.m20*mat.m31 +
      mat.m03*mat.m10*mat.m22*mat.m31 + mat.m03*mat.m11*mat.m20*mat.m32 + mat.m03*mat.m12*mat.m21*mat.m30 -

      mat.m00*mat.m11*mat.m23*mat.m32 - mat.m00*mat.m12*mat.m21*mat.m33 - mat.m00*mat.m13*mat.m22*mat.m31 -
      mat.m01*mat.m10*mat.m22*mat.m33 - mat.m01*mat.m12*mat.m23*mat.m30 - mat.m01*mat.m13*mat.m20*mat.m32 -
      mat.m02*mat.m10*mat.m23*mat.m31 - mat.m02*mat.m11*mat.m20*mat.m33 - mat.m02*mat.m13*mat.m21*mat.m30 -
      mat.m03*mat.m10*mat.m21*mat.m32 - mat.m03*mat.m11*mat.m22*mat.m30 - mat.m03*mat.m12*mat.m20*mat.m31;
  }

  invert() {
    var det = this.determinant();
    var m00 = (this.m11*this.m22*this.m33 + this.m12*this.m23*this.m31 + this.m13*this.m21*this.m32 - this.m11*this.m23*this.m32 - this.m12*this.m21*this.m33 - this.m13*this.m22*this.m31) / det;
    var m01 = (this.m01*this.m23*this.m32 + this.m02*this.m21*this.m33 + this.m03*this.m22*this.m31 - this.m01*this.m22*this.m33 - this.m02*this.m23*this.m31 - this.m03*this.m21*this.m32) / det;
    var m02 = (this.m01*this.m12*this.m33 + this.m02*this.m13*this.m31 + this.m03*this.m11*this.m32 - this.m01*this.m13*this.m32 - this.m02*this.m11*this.m33 - this.m03*this.m12*this.m31) / det;
    var m03 = (this.m01*this.m13*this.m22 + this.m02*this.m11*this.m23 + this.m03*this.m12*this.m21 - this.m01*this.m12*this.m23 - this.m02*this.m13*this.m21 - this.m03*this.m11*this.m22) / det;
    var m10 = (this.m10*this.m23*this.m32 + this.m12*this.m20*this.m33 + this.m13*this.m22*this.m30 - this.m10*this.m22*this.m33 - this.m12*this.m23*this.m30 - this.m13*this.m20*this.m32) / det;
    var m11 = (this.m00*this.m22*this.m33 + this.m02*this.m23*this.m30 + this.m03*this.m20*this.m32 - this.m00*this.m23*this.m32 - this.m02*this.m20*this.m33 - this.m03*this.m22*this.m30) / det;
    var m12 = (this.m00*this.m13*this.m32 + this.m02*this.m10*this.m33 + this.m03*this.m12*this.m30 - this.m00*this.m12*this.m33 - this.m02*this.m13*this.m30 - this.m03*this.m10*this.m32) / det;
    var m13 = (this.m00*this.m12*this.m23 + this.m02*this.m13*this.m20 + this.m03*this.m10*this.m22 - this.m00*this.m13*this.m22 - this.m02*this.m10*this.m23 - this.m03*this.m12*this.m20) / det;
    var m20 = (this.m10*this.m21*this.m33 + this.m11*this.m23*this.m30 + this.m13*this.m20*this.m31 - this.m10*this.m23*this.m31 - this.m11*this.m20*this.m33 - this.m13*this.m21*this.m30) / det;
    var m21 = (this.m00*this.m23*this.m31 + this.m01*this.m20*this.m33 + this.m03*this.m21*this.m30 - this.m00*this.m21*this.m33 - this.m01*this.m23*this.m30 - this.m03*this.m20*this.m31) / det;
    var m22 = (this.m00*this.m11*this.m33 + this.m01*this.m13*this.m30 + this.m03*this.m10*this.m31 - this.m00*this.m13*this.m31 - this.m01*this.m10*this.m33 - this.m03*this.m11*this.m30) / det;
    var m23 = (this.m00*this.m13*this.m21 + this.m01*this.m10*this.m23 + this.m03*this.m11*this.m20 - this.m00*this.m11*this.m23 - this.m01*this.m13*this.m20 - this.m03*this.m10*this.m21) / det;
    var m30 = (this.m10*this.m22*this.m31 + this.m11*this.m20*this.m32 + this.m12*this.m21*this.m30 - this.m10*this.m21*this.m32 - this.m11*this.m22*this.m30 - this.m12*this.m20*this.m31) / det;
    var m31 = (this.m00*this.m21*this.m32 + this.m01*this.m22*this.m30 + this.m02*this.m20*this.m31 - this.m00*this.m22*this.m31 - this.m01*this.m20*this.m32 - this.m02*this.m21*this.m30) / det;
    var m32 = (this.m00*this.m12*this.m31 + this.m01*this.m10*this.m32 + this.m02*this.m11*this.m30 - this.m00*this.m11*this.m32 - this.m01*this.m12*this.m30 - this.m02*this.m10*this.m31) / det;
    var m33 = (this.m00*this.m11*this.m22 + this.m01*this.m12*this.m20 + this.m02*this.m10*this.m21 - this.m00*this.m12*this.m21 - this.m01*this.m10*this.m22 - this.m02*this.m11*this.m20) / det;

    return this.setComponents(
      m00, m01, m02, m03,
      m10, m11, m12, m13,
      m20, m21, m22, m23,
      m30, m31, m32, m33
    );
  }

  static invert(mat) {
    var det = mat.determinant();
    var m00 = (mat.m11*mat.m22*mat.m33 + mat.m12*mat.m23*mat.m31 + mat.m13*mat.m21*mat.m32 - mat.m11*mat.m23*mat.m32 - mat.m12*mat.m21*mat.m33 - mat.m13*mat.m22*mat.m31) / det;
    var m01 = (mat.m01*mat.m23*mat.m32 + mat.m02*mat.m21*mat.m33 + mat.m03*mat.m22*mat.m31 - mat.m01*mat.m22*mat.m33 - mat.m02*mat.m23*mat.m31 - mat.m03*mat.m21*mat.m32) / det;
    var m02 = (mat.m01*mat.m12*mat.m33 + mat.m02*mat.m13*mat.m31 + mat.m03*mat.m11*mat.m32 - mat.m01*mat.m13*mat.m32 - mat.m02*mat.m11*mat.m33 - mat.m03*mat.m12*mat.m31) / det;
    var m03 = (mat.m01*mat.m13*mat.m22 + mat.m02*mat.m11*mat.m23 + mat.m03*mat.m12*mat.m21 - mat.m01*mat.m12*mat.m23 - mat.m02*mat.m13*mat.m21 - mat.m03*mat.m11*mat.m22) / det;
    var m10 = (mat.m10*mat.m23*mat.m32 + mat.m12*mat.m20*mat.m33 + mat.m13*mat.m22*mat.m30 - mat.m10*mat.m22*mat.m33 - mat.m12*mat.m23*mat.m30 - mat.m13*mat.m20*mat.m32) / det;
    var m11 = (mat.m00*mat.m22*mat.m33 + mat.m02*mat.m23*mat.m30 + mat.m03*mat.m20*mat.m32 - mat.m00*mat.m23*mat.m32 - mat.m02*mat.m20*mat.m33 - mat.m03*mat.m22*mat.m30) / det;
    var m12 = (mat.m00*mat.m13*mat.m32 + mat.m02*mat.m10*mat.m33 + mat.m03*mat.m12*mat.m30 - mat.m00*mat.m12*mat.m33 - mat.m02*mat.m13*mat.m30 - mat.m03*mat.m10*mat.m32) / det;
    var m13 = (mat.m00*mat.m12*mat.m23 + mat.m02*mat.m13*mat.m20 + mat.m03*mat.m10*mat.m22 - mat.m00*mat.m13*mat.m22 - mat.m02*mat.m10*mat.m23 - mat.m03*mat.m12*mat.m20) / det;
    var m20 = (mat.m10*mat.m21*mat.m33 + mat.m11*mat.m23*mat.m30 + mat.m13*mat.m20*mat.m31 - mat.m10*mat.m23*mat.m31 - mat.m11*mat.m20*mat.m33 - mat.m13*mat.m21*mat.m30) / det;
    var m21 = (mat.m00*mat.m23*mat.m31 + mat.m01*mat.m20*mat.m33 + mat.m03*mat.m21*mat.m30 - mat.m00*mat.m21*mat.m33 - mat.m01*mat.m23*mat.m30 - mat.m03*mat.m20*mat.m31) / det;
    var m22 = (mat.m00*mat.m11*mat.m33 + mat.m01*mat.m13*mat.m30 + mat.m03*mat.m10*mat.m31 - mat.m00*mat.m13*mat.m31 - mat.m01*mat.m10*mat.m33 - mat.m03*mat.m11*mat.m30) / det;
    var m23 = (mat.m00*mat.m13*mat.m21 + mat.m01*mat.m10*mat.m23 + mat.m03*mat.m11*mat.m20 - mat.m00*mat.m11*mat.m23 - mat.m01*mat.m13*mat.m20 - mat.m03*mat.m10*mat.m21) / det;
    var m30 = (mat.m10*mat.m22*mat.m31 + mat.m11*mat.m20*mat.m32 + mat.m12*mat.m21*mat.m30 - mat.m10*mat.m21*mat.m32 - mat.m11*mat.m22*mat.m30 - mat.m12*mat.m20*mat.m31) / det;
    var m31 = (mat.m00*mat.m21*mat.m32 + mat.m01*mat.m22*mat.m30 + mat.m02*mat.m20*mat.m31 - mat.m00*mat.m22*mat.m31 - mat.m01*mat.m20*mat.m32 - mat.m02*mat.m21*mat.m30) / det;
    var m32 = (mat.m00*mat.m12*mat.m31 + mat.m01*mat.m10*mat.m32 + mat.m02*mat.m11*mat.m30 - mat.m00*mat.m11*mat.m32 - mat.m01*mat.m12*mat.m30 - mat.m02*mat.m10*mat.m31) / det;
    var m33 = (mat.m00*mat.m11*mat.m22 + mat.m01*mat.m12*mat.m20 + mat.m02*mat.m10*mat.m21 - mat.m00*mat.m12*mat.m21 - mat.m01*mat.m10*mat.m22 - mat.m02*mat.m11*mat.m20) / det;

    return new Matrix44(
      m00, m01, m02, m03,
      m10, m11, m12, m13,
      m20, m21, m22, m23,
      m30, m31, m32, m33
    );
  }

  set m00(val) {
    this.m[0] = val;
  }

  get m00() {
    return this.m[0];
  }

  set m10(val) {
    this.m[1] = val;
  }

  get m10() {
    return this.m[1];
  }

  set m20(val) {
    this.m[2] = val;
  }

  get m20() {
    return this.m[2];
  }

  set m30(val) {
    this.m[3] = val;
  }

  get m30() {
    return this.m[3];
  }

  set m01(val) {
    this.m[4] = val;
  }

  get m01() {
    return this.m[4];
  }

  set m11(val) {
    this.m[5] = val;
  }

  get m11() {
    return this.m[5];
  }

  set m21(val) {
    this.m[6] = val;
  }

  get m21() {
    return this.m[6];
  }

  set m31(val) {
    this.m[7] = val;
  }

  get m31() {
    return this.m[7];
  }

  set m02(val) {
    this.m[8] = val;
  }

  get m02() {
    return this.m[8];
  }

  set m12(val) {
    this.m[9] = val;
  }

  get m12() {
    return this.m[9];
  }

  set m22(val) {
    this.m[10] = val;
  }

  get m22() {
    return this.m[10];
  }

  set m32(val) {
    this.m[11] = val;
  }

  get m32() {
    return this.m[11];
  }

  set m03(val) {
    this.m[12] = val;
  }

  get m03() {
    return this.m[12];
  }

  set m13(val) {
    this.m[13] = val;
  }

  get m13() {
    return this.m[13];
  }

  set m23(val) {
    this.m[14] = val;
  }

  get m23() {
    return this.m[14];
  }

  set m33(val) {
    this.m[15] = val;
  }

  get m33() {
    return this.m[15];
  }

  toString() {
    return this.m00 + ' ' + this.m01 + ' ' + this.m02 + ' ' + this.m03 + ' \n' +
      this.m10 + ' ' + this.m11 + ' ' + this.m12 + ' ' + this.m13 + ' \n' +
      this.m20 + ' ' + this.m21 + ' ' + this.m22 + ' ' + this.m23 + ' \n' +
      this.m30 + ' ' + this.m31 + ' ' + this.m32 + ' ' + this.m33 + ' \n';
  }

  nearZeroToZero(value) {
    if (Math.abs(value) < 0.00001) {
      value = 0;
    } else if (0.99999 < value && value < 1.00001) {
      value = 1;
    } else if (-1.00001 < value && value < -0.99999) {
      value = -1;
    }
    return value;
  }

  toStringApproximately() {
    return this.nearZeroToZero(this.m00) + ' ' + this.nearZeroToZero(this.m01) + ' ' + this.nearZeroToZero(this.m02) + ' ' + this.nearZeroToZero(this.m03) + ' \n' +
      this.nearZeroToZero(this.m10) + ' ' + this.nearZeroToZero(this.m11) + ' ' + this.nearZeroToZero(this.m12) + ' ' + this.nearZeroToZero(this.m13) + ' \n' +
      this.nearZeroToZero(this.m20) + ' ' + this.nearZeroToZero(this.m21) + ' ' + this.nearZeroToZero(this.m22) + ' ' + this.nearZeroToZero(this.m23) + ' \n' +
      this.nearZeroToZero(this.m30) + ' ' + this.nearZeroToZero(this.m31) + ' ' + this.nearZeroToZero(this.m32) + ' ' + this.nearZeroToZero(this.m33) + ' \n';
  }


}

GLBoost["Matrix44"] = Matrix44;
