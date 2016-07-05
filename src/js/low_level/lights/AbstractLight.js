import Element from '../elements/Element';

/**
 * [en] This is the abstract class for all lights classes. Don't use this class directly.<br>
 * [ja] 全ての光源クラスのための抽象クラスです。直接このクラスは使わないでください。
 */
export default class AbstractLight extends Element {
  constructor(glBoostContext) {
    super(glBoostContext);

    if (this.constructor === AbstractLight) {
      throw new TypeError("Cannot construct AbstractLight instances directly.");
    }

    this._gl = this._glContext.gl;
    this._name = "";
  }
}
