import {assert} from 'chai';

import {parseMainAxis} from '../../src/compile/axis/parse';
import {LayerModel} from '../../src/compile/layer';
import {LayerSpec} from '../../src/spec';
import {parseLayerModel} from '../util';

describe('Layer', function() {
  describe('merge scale domains', () => {
    it('should merge domains', () => {
      const model = parseLayerModel({
        layer: [{
          mark: 'point',
          encoding: {
            x: {field: 'a', type: 'ordinal'}
          }
        },{
          mark: 'point',
          encoding: {
            x: {field: 'b', type: 'ordinal'}
          }
        }]
      });
      assert.equal(model.children.length, 2);
      model.parseScale();

      assert.deepEqual(model.component.scales['x'].domain, {
        fields: [{
          data: 'layer_0_main',
          field: 'a'
        },{
          data: 'layer_1_main',
          field: 'b'
        }],
        sort: true
      });
    });

    it('should union explicit and referenced domains', () => {
      const model = parseLayerModel({
        layer: [{
          mark: 'point',
          encoding: {
            x: {scale: {domain: [1, 2, 3]}, field: 'b', type: 'ordinal'}
          }
        },{
          mark: 'point',
          encoding: {
            x: {field: 'b', type: 'ordinal'}
          }
        }]
      });
      model.parseScale();

      assert.deepEqual(model.component.scales['x'].domain, {
        fields: [
          [1, 2, 3],
          {
            data: 'layer_1_main',
            field: 'b'
          }
        ],
        sort: true
      });
    });
  });

  describe('dual axis chart', () => {
    const model = parseLayerModel({
      layer: [{
        mark: 'point',
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        }
      },{
        mark: 'point',
        encoding: {
          x: {field: 'b', type: 'quantitative'}
        }
      }],
      resolve: {
        x: {
          scale: 'independent'
        }
      }
    });

    assert.equal(model.children.length, 2);

    it('should leave scales in children', () => {
      model.parseScale();

      assert.equal(model.component.scales['x'], undefined);
      assert.deepEqual(model.children[0].component.scales['x'].domain, {
        data: 'layer_0_main',
        field: 'a'
      });
      assert.deepEqual(model.children[1].component.scales['x'].domain, {
        data: 'layer_1_main',
        field: 'b'
      });
    });

    it('should create second axis on top', () => {
      model.parseAxisAndHeader();

      assert.equal(model.component.axes['x'].axes.length, 2);
      assert.equal(model.component.axes['x'].axes[1].orient, 'top');
    });
  });
});
