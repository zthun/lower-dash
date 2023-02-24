import { IZFilter } from './filter';
import { IZFilterSubject } from './filter-subject';

/**
 * Represents the connector for a logic filter.
 */
export enum ZOperatorLogic {
  /**
   * And.
   */
  And = 'and',
  /**
   * Or
   */
  Or = 'or'
}

/**
 * Represents a composite logical filter.
 */
export interface IZFilterLogic extends IZFilterSubject<ZOperatorLogic, IZFilter[]> {}

/**
 * Represents a builder for a logic filter.
 */
export class ZFilterLogicBuilder {
  public static readonly Type = 'logic';

  private _filter: IZFilterLogic;

  /**
   * Initializes a new instance of this object.
   */
  public constructor() {
    this._filter = {
      subject: [],
      operator: ZOperatorLogic.And,
      __type__: ZFilterLogicBuilder.Type
    };
  }

  /**
   * Sets the operator to and.
   *
   * @returns
   *        This object.
   */
  public and(): this {
    this._filter.operator = ZOperatorLogic.And;
    return this;
  }

  /**
   * Sets the operator to or.
   *
   * @returns
   *        This object.
   */
  public or(): this {
    this._filter.operator = ZOperatorLogic.Or;
    return this;
  }

  /**
   * Adds another clause.
   *
   * @param val -
   *        The clause to add.
   *
   * @returns
   *        This object.
   */
  public clause(val: IZFilter): this {
    this._filter.subject.push(val);
    return this;
  }

  /**
   * Sets the list of clauses.
   *
   * @param val -
   *        The value to set.
   *
   * @returns
   *        This object
   */
  public clauses(val: IZFilter[]): this {
    this._filter.subject = val;
    return this;
  }

  /**
   * Returns the filter.
   *
   * @returns
   *        The logic filter
   */
  public build(): IZFilterLogic {
    return { ...this._filter };
  }
}

/**
 * Type guard for determining if a target filter is a logic filter.
 *
 * @param filter -
 *        The filter to test.
 *
 * @returns
 *        True if filters type is a logic filter.  False otherwise.
 */
export function isLogicFilter(filter: IZFilterSubject<any, any>): filter is IZFilterLogic {
  return filter.__type__ === ZFilterLogicBuilder.Type;
}
