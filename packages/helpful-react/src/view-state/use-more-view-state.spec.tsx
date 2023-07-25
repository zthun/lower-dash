// @vitest-environment jsdom

import { IZCircusReactHook, ZCircusSetupHook } from '@zthun/cirque-du-react';
import { sleep } from '@zthun/helpful-fn';
import {
  IZDataRequest,
  IZDataSource,
  ZDataRequestBuilder,
  ZDataSourceStatic,
  ZDataSourceStaticOptionsBuilder
} from '@zthun/helpful-query';
import { range } from 'lodash';
import React, { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { asStateError, isStateLoading } from '../async-state/use-async-state';
import { useMoreViewState } from './use-more-view-state';

describe('useMoreViewState', () => {
  let source: IZDataSource<number>;
  let template: IZDataRequest;

  const rerender = async (target: IZCircusReactHook<any, any>) => {
    await sleep(100);
    await target.rerender();
  };

  const createTestTarget = async () => {
    const wrapper = ({ children }) => <StrictMode>{children}</StrictMode>;
    const target = await new ZCircusSetupHook(() => useMoreViewState(source, template), { wrapper }).setup();
    await rerender(target);
    return target;
  };

  beforeEach(() => {
    template = new ZDataRequestBuilder().size(20).build();
  });

  describe('Loading', () => {
    beforeEach(() => {
      source = new ZDataSourceStatic<number>([], new ZDataSourceStaticOptionsBuilder().delay(500).build());
    });

    it('should begin loading the start page', async () => {
      // Arrange.
      const target = await createTestTarget();
      // Act.
      const { last } = await target.current();
      const actual = isStateLoading(last);
      // Assert.
      expect(actual).toBeTruthy();
    });

    it('should return an empty view', async () => {
      // Arrange.
      const target = await createTestTarget();
      // Act.
      const { view: actual } = await target.current();
      // Assert.
      expect(actual).toEqual([]);
    });
  });

  describe('Success', () => {
    let data: number[];
    beforeEach(() => {
      data = range(0, 100);
      source = new ZDataSourceStatic(data);
    });

    it('should load the first page', async () => {
      // Arrange.
      const expected = data.slice(0, 20);
      const target = await createTestTarget();
      // Act.
      const { view: actual } = await target.current();
      // Assert.
      expect(actual).toEqual(expected);
    });

    it('should append to the current view', async () => {
      // Arrange.
      const expected = data.slice(0, 60);
      const target = await createTestTarget();
      // Act.
      const { more } = await target.current();
      more();
      await rerender(target);
      more();
      await rerender(target);
      const { view: actual } = await target.current();
      // Assert.
      expect(actual).toEqual(expected);
    });

    it('should load everything in one big invocation if there is no page size', async () => {
      // Arrange.
      template = new ZDataRequestBuilder().build();
      const target = await createTestTarget();
      // Act.
      const { view: actual } = await target.current();
      // Assert.
      expect(actual).toEqual(data);
    });
  });

  describe('Error', () => {
    beforeEach(() => {
      source = new ZDataSourceStatic<number>(new Error('Something went wrong'));
    });

    it('should output an error as the last request', async () => {
      // Arrange.
      const target = await createTestTarget();
      // Act.
      const { last } = await target.current();
      // Assert.
      expect(last).toBeInstanceOf(Error);
    });

    it('should output the exact error if a non error is returned', async () => {
      // Arrange.
      const _source = mock<IZDataSource<number>>();
      const expected = 'Non Error Returned';
      _source.count.mockResolvedValue(10);
      _source.retrieve.mockRejectedValue(expected);
      source = _source;
      const target = await createTestTarget();
      // Act.
      const { last } = await target.current();
      const actual = asStateError(last);
      // Assert.
      expect(actual).toBeTruthy();
      expect(actual?.message).toEqual(expected);
    });

    it('should reset on a more call', async () => {
      // Arrange.
      vi.spyOn(source, 'count');
      const target = await createTestTarget();
      // Act.
      const { more } = await target.current();
      more();
      await rerender(target);
      more();
      await rerender(target);
      // Assert
      expect(source.count).toHaveBeenCalledTimes(3);
    });
  });
});
